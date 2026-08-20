import logging
import pandas as pd
import numpy as np
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.models import Stock, DailyPrice, TechnicalIndicator

logger = logging.getLogger("TechnicalIndicatorEngine")
logger.setLevel(logging.INFO)

class TechnicalIndicatorEngine:
    def __init__(self, db: Session):
        self.db = db

    def calculate_all_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Kalkulasi seluruh indikator teknikal menggunakan operasi ter-vektorisasi Pandas.
        DF input wajib memiliki kolom: date, open, high, low, close, volume, value.
        """
        if len(df) < 2:
            return df

        # Pastikan terurut berdasarkan tanggal ascending
        df = df.sort_values("date").reset_index(drop=True)

        close = df["close"]
        high = df["high"]
        low = df["low"]
        volume = df["volume"]
        value = df["value"]

        # 1. SMA & EMA
        df["sma_50"] = close.rolling(window=50).mean()
        df["sma_200"] = close.rolling(window=200).mean()
        df["ema_50"] = close.ewm(span=50, adjust=False).mean()
        df["ema_200"] = close.ewm(span=200, adjust=False).mean()

        # 2. RSI (14)
        delta = close.diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        avg_gain = gain.ewm(com=13, adjust=False).mean()
        avg_loss = loss.ewm(com=13, adjust=False).mean()
        rs = avg_gain / (avg_loss + 1e-10)
        df["rsi"] = 100 - (100 / (1 + rs))

        # 3. MACD (12, 26, 9)
        ema_fast = close.ewm(span=12, adjust=False).mean()
        ema_slow = close.ewm(span=26, adjust=False).mean()
        df["macd"] = ema_fast - ema_slow
        df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()
        df["macd_hist"] = df["macd"] - df["macd_signal"]

        # 4. ATR (14)
        high_low = high - low
        high_close_prev = (high - close.shift(1)).abs()
        low_close_prev = (low - close.shift(1)).abs()
        tr = pd.concat([high_low, high_close_prev, low_close_prev], axis=1).max(axis=1)
        df["atr"] = tr.ewm(alpha=1/14, adjust=False).mean()

        # 5. ADX (14)
        up_move = high.diff()
        down_move = low.diff()
        plus_dm = np.where((up_move > 0) & (up_move > down_move), up_move, 0.0)
        minus_dm = np.where((down_move > 0) & (down_move > up_move), down_move, 0.0)
        plus_di = 100 * pd.Series(plus_dm).ewm(alpha=1/14, adjust=False).mean() / (df["atr"] + 1e-10)
        minus_di = 100 * pd.Series(minus_dm).ewm(alpha=1/14, adjust=False).mean() / (df["atr"] + 1e-10)
        dx = 100 * (plus_di - minus_di).abs() / (plus_di + minus_di + 1e-10)
        df["adx"] = dx.ewm(alpha=1/14, adjust=False).mean()

        # 6. CCI (20)
        tp = (high + low + close) / 3
        sma_tp = tp.rolling(20).mean()
        mad = tp.rolling(20).apply(lambda x: np.abs(x - x.mean()).mean(), raw=True)
        df["cci"] = (tp - sma_tp) / (0.015 * mad + 1e-10)

        # 7. ROC (12)
        df["roc"] = ((close - close.shift(12)) / (close.shift(12) + 1e-10)) * 100

        # 8. VWAP (Harian)
        df["vwap"] = value / (volume + 1e-10)

        # 9. Bollinger Bands (20, 2)
        bb_sma = close.rolling(20).mean()
        bb_std = close.rolling(20).std()
        df["bb_middle"] = bb_sma
        df["bb_upper"] = bb_sma + (2 * bb_std)
        df["bb_lower"] = bb_sma - (2 * bb_std)

        # 10. Stochastic Oscillator (14, 3)
        low_min = low.rolling(14).min()
        high_max = high.rolling(14).max()
        df["stoch_k"] = 100 * (close - low_min) / (high_max - low_min + 1e-10)
        df["stoch_d"] = df["stoch_k"].rolling(3).mean()

        # 11. OBV (On-Balance Volume)
        df["obv"] = (np.sign(close.diff().fillna(0)) * volume).cumsum()

        # 12. Money Flow Index (MFI - 14)
        rmf = tp * volume
        tp_diff = tp.diff()
        pos_mf = rmf.where(tp_diff > 0, 0.0).rolling(14).sum()
        neg_mf = rmf.where(tp_diff < 0, 0.0).rolling(14).sum()
        mfr = pos_mf / (neg_mf + 1e-10)
        df["mfi"] = 100 - (100 / (1 + mfr))

        # 13. Ichimoku Kinko Hyo (9, 26)
        df["ichimoku_tenkan"] = (high.rolling(9).max() + low.rolling(9).min()) / 2
        df["ichimoku_kijun"] = (high.rolling(26).max() + low.rolling(26).min()) / 2

        # 14. Supertrend (10, 3) - Membutuhkan loop state cepat karena bersifat rekursif
        df["supertrend"] = self._calculate_supertrend(df)

        return df

    def _calculate_supertrend(self, df: pd.DataFrame, period: int = 10, multiplier: float = 3.0) -> pd.Series:
        """Kalkulasi Supertrend menggunakan gabungan Pandas & NumPy loop."""
        hl2 = (df["high"] + df["low"]) / 2
        atr = df["atr"]
        
        # Buat batas atas dan bawah dasar
        basic_upper = hl2 + multiplier * atr
        basic_lower = hl2 - multiplier * atr
        
        # Inisialisasi array kosong
        size = len(df)
        final_upper = np.zeros(size)
        final_lower = np.zeros(size)
        supertrend = np.zeros(size)
        trend = np.zeros(size) # 1 = uptrend, -1 = downtrend

        close = df["close"].values
        basic_upper_val = basic_upper.values
        basic_lower_val = basic_lower.values

        for i in range(1, size):
            # Hitung Upper Band Final
            if basic_upper_val[i] < final_upper[i-1] or close[i-1] > final_upper[i-1]:
                final_upper[i] = basic_upper_val[i]
            else:
                final_upper[i] = final_upper[i-1]

            # Hitung Lower Band Final
            if basic_lower_val[i] > final_lower[i-1] or close[i-1] < final_lower[i-1]:
                final_lower[i] = basic_lower_val[i]
            else:
                final_lower[i] = final_lower[i-1]

            # Deteksi Switch Trend
            if supertrend[i-1] == final_upper[i-1]:
                trend[i] = 1 if close[i] > final_upper[i] else -1
            else:
                trend[i] = -1 if close[i] < final_lower[i] else 1

            # Hitung Nilai Supertrend Akhir
            if trend[i] == 1:
                supertrend[i] = final_lower[i]
            else:
                supertrend[i] = final_upper[i]

        return pd.Series(supertrend, index=df.index)

    def sync_stock_indicators(self, ticker: str, force_recalculate: bool = False):
        """
        Menyinkronkan dan menghitung ulang seluruh indikator untuk emiten tertentu,
        dan menyimpannya ke database. Mencegah perhitungan ulang tanggal yang sudah ada di DB.
        """
        stock = self.db.query(Stock).filter(Stock.ticker == ticker).first()
        if not stock:
            raise ValueError(f"Stock dengan ticker {ticker} tidak terdaftar.")

        # Ambil harga harian dari database
        prices = self.db.query(DailyPrice).filter(DailyPrice.stock_id == stock.id).order_by(DailyPrice.date.asc()).all()
        if not prices:
            logger.warning(f"Tidak ada data harga untuk {ticker}. Perhitungan indikator dibatalkan.")
            return

        # Dapatkan tanggal terakhir indikator di DB untuk incremental update
        last_indicator = self.db.query(TechnicalIndicator).filter(TechnicalIndicator.stock_id == stock.id).order_by(TechnicalIndicator.date.desc()).first()
        
        # Konversi ke Pandas DataFrame
        data = {
            "date": [p.date for p in prices],
            "open": [float(p.open) for p in prices],
            "high": [float(p.high) for p in prices],
            "low": [float(p.low) for p in prices],
            "close": [float(p.close) for p in prices],
            "volume": [p.volume for p in prices],
            "value": [p.value for p in prices]
        }
        df = pd.DataFrame(data)

        # Kalkulasi
        df_indicators = self.calculate_all_indicators(df)
        
        # Filter data baru jika bukan kalkulasi ulang paksa
        if last_indicator and not force_recalculate:
            df_indicators = df_indicators[df_indicators["date"] > last_indicator.date]

        if df_indicators.empty:
            logger.info(f"Semua indikator teknikal {ticker} sudah mutakhir.")
            return

        logger.info(f"Menyimpan {len(df_indicators)} baris indikator baru untuk {ticker} ke DB...")
        
        # Batch insert/upsert ke DB menggunakan ORM
        for _, row in df_indicators.iterrows():
            def sanitize(val):
                return None if pd.isna(val) else float(val) if isinstance(val, (np.floating, float)) else int(val) if isinstance(val, (np.integer,)) else val

            # Cek duplikat sebelum insert
            existing = self.db.query(TechnicalIndicator).filter(
                TechnicalIndicator.stock_id == stock.id,
                TechnicalIndicator.date == row["date"]
            ).first()

            indicator_data = {
                "rsi": sanitize(row["rsi"]),
                "macd": sanitize(row["macd"]),
                "macd_signal": sanitize(row["macd_signal"]),
                "macd_hist": sanitize(row["macd_hist"]),
                "ema_50": sanitize(row["ema_50"]),
                "ema_200": sanitize(row["ema_200"]),
                "sma_50": sanitize(row["sma_50"]),
                "sma_200": sanitize(row["sma_200"]),
                "atr": sanitize(row["atr"]),
                "adx": sanitize(row["adx"]),
                "cci": sanitize(row["cci"]),
                "roc": sanitize(row["roc"]),
                "vwap": sanitize(row["vwap"]),
                "supertrend": sanitize(row["supertrend"]),
                "bb_upper": sanitize(row["bb_upper"]),
                "bb_middle": sanitize(row["bb_middle"]),
                "bb_lower": sanitize(row["bb_lower"]),
                "stoch_k": sanitize(row["stoch_k"]),
                "stoch_d": sanitize(row["stoch_d"]),
                "obv": sanitize(row["obv"]),
                "mfi": sanitize(row["mfi"]),
                "ichimoku_tenkan": sanitize(row["ichimoku_tenkan"]),
                "ichimoku_kijun": sanitize(row["ichimoku_kijun"])
            }

            if existing:
                for key, value in indicator_data.items():
                    setattr(existing, key, value)
            else:
                new_indicator = TechnicalIndicator(
                    stock_id=stock.id,
                    date=row["date"],
                    **indicator_data
                )
                self.db.add(new_indicator)

        self.db.commit()
        logger.info(f"Berhasil meng-update indikator teknikal untuk {ticker}.")

