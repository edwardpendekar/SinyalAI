import logging
import numpy as np
import pandas as pd
from datetime import date, datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.models import Stock, DailyPrice, TechnicalIndicator, ScannerResult

logger = logging.getLogger("DivergenceEngine")
logger.setLevel(logging.INFO)

class DivergenceDetectionEngine:
    def __init__(self, db: Session):
        self.db = db

    def find_pivots(self, prices: np.ndarray, left_bars: int = 5, right_bars: int = 5):
        """
        Mencari pivot high dan pivot low secara historis.
        Return: (list of low pivot indices, list of high pivot indices)
        """
        pivots_low = []
        pivots_high = []
        size = len(prices)

        for i in range(left_bars, size - right_bars):
            val = prices[i]
            
            # Pivot Low Check
            is_low = True
            for j in range(i - left_bars, i):
                if prices[j] <= val:
                    is_low = False
                    break
            if is_low:
                for j in range(i + 1, i + right_bars + 1):
                    if prices[j] <= val:
                        is_low = False
                        break
            if is_low:
                pivots_low.append(i)

            # Pivot High Check
            is_high = True
            for j in range(i - left_bars, i):
                if prices[j] >= val:
                    is_high = False
                    break
            if is_high:
                for j in range(i + 1, i + right_bars + 1):
                    if prices[j] >= val:
                        is_high = False
                        break
            if is_high:
                pivots_high.append(i)

        return pivots_low, pivots_high

    def scan_divergence(
        self, 
        df: pd.DataFrame, 
        indicator_name: str, 
        pivot_left: int = 5, 
        pivot_right: int = 5,
        min_swing_dist: int = 5,
        max_swing_dist: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Mendeteksi Regular & Hidden Divergence untuk satu indikator pada data saham.
        Non-Repaint: Sinyal tercatat pada index ke (pivot_low_index + pivot_right) yaitu hari konfirmasi.
        """
        signals = []
        if len(df) < max_swing_dist + pivot_right:
            return signals

        prices_low = df["low"].values
        prices_high = df["high"].values
        prices_close = df["close"].values
        volume = df["volume"].values
        dates = df["date"].values
        
        # Pengecekan ketersediaan kolom indikator
        if indicator_name not in df.columns:
            return signals
        ind_vals = df[indicator_name].values
        
        # Cari pivot points
        p_lows, p_highs = self.find_pivots(prices_close, left_bars=pivot_left, right_bars=pivot_right)

        # 1. SCAN BULLISH DIVERGENCE (Menggunakan Pivot Lows)
        for i in range(1, len(p_lows)):
            p1 = p_lows[i-1] # Pivot Low Sebelumnya
            p2 = p_lows[i]   # Pivot Low Saat Ini
            
            dist = p2 - p1
            if dist < min_swing_dist or dist > max_swing_dist:
                continue

            price_l1 = prices_low[p1]
            price_l2 = prices_low[p2]
            ind_l1 = ind_vals[p1]
            ind_l2 = ind_vals[p2]

            # Cek jika ada nilai null
            if pd.isna(ind_l1) or pd.isna(ind_l2):
                continue

            confirmed_idx = p2 + pivot_right
            if confirmed_idx >= len(df):
                continue
            
            confirmed_date = dates[confirmed_idx]
            
            # --- Regular Bullish Divergence ---
            # Harga mencatat Lower Low, Indikator mencatat Higher Low
            if price_l2 < price_l1 and ind_l2 > ind_l1:
                conf_score = self._calculate_confidence(
                    trend_up=prices_close[confirmed_idx] > df["ema_200"].iloc[confirmed_idx] if "ema_200" in df.columns else True,
                    slope_price=(price_l2 - price_l1)/price_l1,
                    slope_ind=(ind_l2 - ind_l1)/100.0,
                    vol_ratio=volume[p2]/(volume[p1] + 1e-10)
                )
                explanation = (
                    f"Terdeteksi Regular Bullish Divergence pada {indicator_name}. "
                    f"Harga membentuk Lower Low pada Rp {price_l2:,.0f} (dibanding Rp {price_l1:,.0f} sebelumnya), "
                    f"sedangkan {indicator_name} mencatat Higher Low pada {ind_l2:.2f} (dibanding {ind_l1:.2f}). "
                    f"Sinyal dikonfirmasi pada {confirmed_date}."
                )
                signals.append({
                    "date": str(confirmed_date),
                    "type": "Regular Bullish",
                    "indicator": indicator_name,
                    "price_pivot1": float(price_l1),
                    "price_pivot2": float(price_l2),
                    "ind_pivot1": float(ind_l1),
                    "ind_pivot2": float(ind_l2),
                    "confidence_score": conf_score,
                    "explanation": explanation
                })

            # --- Hidden Bullish Divergence ---
            # Harga mencatat Higher Low, Indikator mencatat Lower Low
            elif price_l2 > price_l1 and ind_l2 < ind_l1:
                conf_score = self._calculate_confidence(
                    trend_up=prices_close[confirmed_idx] > df["ema_200"].iloc[confirmed_idx] if "ema_200" in df.columns else True,
                    slope_price=(price_l2 - price_l1)/price_l1,
                    slope_ind=(ind_l2 - ind_l1)/100.0,
                    vol_ratio=volume[p2]/(volume[p1] + 1e-10)
                )
                explanation = (
                    f"Terdeteksi Hidden Bullish Divergence pada {indicator_name}. "
                    f"Harga membentuk Higher Low pada Rp {price_l2:,.0f} (dibanding Rp {price_l1:,.0f} sebelumnya), "
                    f"sedangkan {indicator_name} mencatat Lower Low pada {ind_l2:.2f} (dibanding {ind_l1:.2f}). "
                    f"Ini menunjukkan kelanjutan tren naik (trend continuation) dikonfirmasi pada {confirmed_date}."
                )
                signals.append({
                    "date": str(confirmed_date),
                    "type": "Hidden Bullish",
                    "indicator": indicator_name,
                    "price_pivot1": float(price_l1),
                    "price_pivot2": float(price_l2),
                    "ind_pivot1": float(ind_l1),
                    "ind_pivot2": float(ind_l2),
                    "confidence_score": conf_score,
                    "explanation": explanation
                })

        # 2. SCAN BEARISH DIVERGENCE (Menggunakan Pivot Highs)
        for i in range(1, len(p_highs)):
            p1 = p_highs[i-1]
            p2 = p_highs[i]

            dist = p2 - p1
            if dist < min_swing_dist or dist > max_swing_dist:
                continue

            price_h1 = prices_high[p1]
            price_h2 = prices_high[p2]
            ind_h1 = ind_vals[p1]
            ind_h2 = ind_vals[p2]

            if pd.isna(ind_h1) or pd.isna(ind_h2):
                continue

            confirmed_idx = p2 + pivot_right
            if confirmed_idx >= len(df):
                continue
            confirmed_date = dates[confirmed_idx]

            # --- Regular Bearish Divergence ---
            # Harga mencatat Higher High, Indikator mencatat Lower High
            if price_h2 > price_h1 and ind_h2 < ind_h1:
                conf_score = self._calculate_confidence(
                    trend_up=prices_close[confirmed_idx] < df["ema_200"].iloc[confirmed_idx] if "ema_200" in df.columns else True, # Trend turun meningkatkan konfirmasi bearish
                    slope_price=(price_h2 - price_h1)/price_h1,
                    slope_ind=(ind_h2 - ind_h1)/100.0,
                    vol_ratio=volume[p2]/(volume[p1] + 1e-10)
                )
                explanation = (
                    f"Terdeteksi Regular Bearish Divergence pada {indicator_name}. "
                    f"Harga membentuk Higher High pada Rp {price_h2:,.0f} (dibanding Rp {price_h1:,.0f} sebelumnya), "
                    f"sedangkan {indicator_name} mencatat Lower High pada {ind_h2:.2f} (dibanding {ind_h1:.2f}). "
                    f"Ini menunjukkan pembalikan tren turun (bearish reversal) dikonfirmasi pada {confirmed_date}."
                )
                signals.append({
                    "date": str(confirmed_date),
                    "type": "Regular Bearish",
                    "indicator": indicator_name,
                    "price_pivot1": float(price_h1),
                    "price_pivot2": float(price_h2),
                    "ind_pivot1": float(ind_h1),
                    "ind_pivot2": float(ind_h2),
                    "confidence_score": conf_score,
                    "explanation": explanation
                })

            # --- Hidden Bearish Divergence ---
            # Harga mencatat Lower High, Indikator mencatat Higher High
            elif price_h2 < price_h1 and ind_h2 > ind_h1:
                conf_score = self._calculate_confidence(
                    trend_up=prices_close[confirmed_idx] < df["ema_200"].iloc[confirmed_idx] if "ema_200" in df.columns else True,
                    slope_price=(price_h2 - price_h1)/price_h1,
                    slope_ind=(ind_h2 - ind_h1)/100.0,
                    vol_ratio=volume[p2]/(volume[p1] + 1e-10)
                )
                explanation = (
                    f"Terdeteksi Hidden Bearish Divergence pada {indicator_name}. "
                    f"Harga membentuk Lower High pada Rp {price_h2:,.0f} (dibanding Rp {price_h1:,.0f} sebelumnya), "
                    f"sedangkan {indicator_name} mencatat Higher High pada {ind_h2:.2f} (dibanding {ind_h1:.2f}). "
                    f"Ini menunjukkan kelanjutan tren turun (trend continuation) dikonfirmasi pada {confirmed_date}."
                )
                signals.append({
                    "date": str(confirmed_date),
                    "type": "Hidden Bearish",
                    "indicator": indicator_name,
                    "price_pivot1": float(price_h1),
                    "price_pivot2": float(price_h2),
                    "ind_pivot1": float(ind_h1),
                    "ind_pivot2": float(ind_h2),
                    "confidence_score": conf_score,
                    "explanation": explanation
                })

        return signals

    def _calculate_confidence(self, trend_up: bool, slope_price: float, slope_ind: float, vol_ratio: float) -> float:
        """
        Hitung Confidence Score (0.0 - 100.0) berdasarkan aspek tren dan volume.
        """
        score = 50.0  # Base score
        
        # 1. Konfirmasi Tren (Uptrend untuk bullish, Downtrend untuk bearish)
        if trend_up:
            score += 15.0
        else:
            score -= 10.0

        # 2. Konfirmasi Volume pada pivot ke-2 (Akumulasi / Distribusi)
        if vol_ratio > 1.2:
            score += 15.0
        elif vol_ratio > 1.0:
            score += 5.0
        else:
            score -= 5.0

        # 3. Kemiringan Divergensi (Semakin tajam perbedaan kemiringan, semakin tinggi confidence)
        slope_diff = abs(slope_ind - slope_price)
        if slope_diff > 0.3:
            score += 20.0
        elif slope_diff > 0.1:
            score += 10.0

        # Batasi score 0 s.d 100
        return float(np.clip(score, 0.0, 100.0))

    def detect_and_store_all_divergences(self, ticker: str):
        """
        Pindai divergensi multi-indikator untuk emiten tertentu,
        dan simpan hasilnya ke tabel scanner_results di dalam JSONB 'conditions_passed'.
        """
        stock = self.db.query(Stock).filter(Stock.ticker == ticker).first()
        if not stock:
            return

        # Dapatkan gabungan data harga harian dan indikator teknikal dari DB
        sql = text("""
            SELECT p.date, p.open, p.high, p.low, p.close, p.volume, p.value,
                   ti.rsi, ti.macd, ti.macd_hist, ti.stoch_k as stochastic, ti.cci, ti.ema_200
            FROM daily_prices p
            JOIN technical_indicators ti ON p.stock_id = ti.stock_id AND p.date = ti.date
            WHERE p.stock_id = :stock_id
            ORDER BY p.date ASC;
        """)
        results = self.db.execute(sql, {"stock_id": stock.id}).fetchall()
        if not results:
            return

        # Konversi ke DataFrame Pandas
        columns = ["date", "open", "high", "low", "close", "volume", "value", "rsi", "macd", "macd_hist", "stochastic", "cci", "ema_200"]
        df = pd.DataFrame(results, columns=columns)

        # Cari divergensi untuk setiap indikator pendukung
        indicators_to_check = ["rsi", "macd", "macd_hist", "stochastic", "cci"]
        all_signals = []

        for ind in indicators_to_check:
            signals = self.scan_divergence(df, indicator_name=ind)
            all_signals.extend(signals)

        if not all_signals:
            return

        # Kelompokkan sinyal berdasarkan tanggal konfirmasi
        signals_by_date = {}
        for sig in all_signals:
            sig_date = sig["date"]
            if sig_date not in signals_by_date:
                signals_by_date[sig_date] = []
            signals_by_date[sig_date].append(sig)

        logger.info(f"Menyimpan {len(all_signals)} sinyal divergensi untuk {ticker} ke DB...")
        
        # Simpan ke tabel scanner_results
        for sig_date_str, sig_list in signals_by_date.items():
            sig_date_obj = datetime.strptime(sig_date_str, "%Y-%m-%d").date()
            # Cari apakah baris scanner_results sudah ada untuk tanggal tersebut
            existing_res = self.db.query(ScannerResult).filter(
                ScannerResult.stock_id == stock.id,
                ScannerResult.date == sig_date_obj
            ).first()

            divergence_data = {
                "divergences": sig_list
            }

            if existing_res:
                # Merge data ke JSONB yang sudah ada
                current_json = existing_res.conditions_passed
                if not current_json:
                    current_json = {}
                current_json.update(divergence_data)
                
                existing_res.conditions_passed = current_json
            else:
                # Buat baris baru
                new_res = ScannerResult(
                    stock_id=stock.id,
                    date=sig_date_obj,
                    ai_score=0, # Akan diperbarui oleh scoring engine nanti
                    conditions_passed=divergence_data,
                    recommendation="Hold"
                )
                self.db.add(new_res)

        self.db.commit()
        logger.info(f"Berhasil memproses & menyimpan seluruh divergensi untuk {ticker}.")
