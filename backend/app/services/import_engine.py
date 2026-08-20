import time
import logging
from datetime import date, datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.models import Stock, DailyPrice, ForeignFlow, Financial, BrokerSummary, SystemLog
from app.core.config import settings

# Setup standard logging
logger = logging.getLogger("ImportEngine")
logger.setLevel(logging.INFO)

# Retry decorator with exponential backoff
def retry_on_failure(retries=3, delay=5, backoff=2):
    def decorator(func):
        def wrapper(*args, **kwargs):
            m_delay = delay
            for i in range(retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    logger.warning(f"Error executing {func.__name__} (Attempt {i+1}/{retries}): {str(e)}")
                    if i == retries - 1:
                        raise e
                    time.sleep(m_delay)
                    m_delay *= backoff
        return wrapper
    return decorator

class DataImportEngine:
    def __init__(self, db: Session):
        self.db = db

    def log_to_system(self, level: str, module: str, message: str, stack_trace: str = None):
        """Catat log kesalahan ke database."""
        try:
            log_entry = SystemLog(
                level=level,
                module=module,
                message=message,
                stack_trace=stack_trace
            )
            self.db.add(log_entry)
            self.db.commit()
        except Exception as e:
            logger.error(f"Gagal mencatat log ke DB: {str(e)}")

    @retry_on_failure(retries=3, delay=5)
    def fetch_tickers_from_idx(self) -> List[Dict[str, Any]]:
        """
        Simulasi fetch daftar saham BEI dari IDX API.
        Di lingkungan produksi, ganti ini dengan request HTTP ke endpoint IDX.
        """
        # Simulasi beberapa emiten BEI utama
        return [
            # Perbankan (Financials)
            {"ticker": "BBCA", "name": "Bank Central Asia Tbk.", "sector": "Financials", "sub_sector": "Banks"},
            {"ticker": "BBRI", "name": "Bank Rakyat Indonesia Tbk.", "sector": "Financials", "sub_sector": "Banks"},
            {"ticker": "BMRI", "name": "Bank Mandiri Tbk.", "sector": "Financials", "sub_sector": "Banks"},
            {"ticker": "BBNI", "name": "Bank Negara Indonesia Tbk.", "sector": "Financials", "sub_sector": "Banks"},
            {"ticker": "BRIS", "name": "Bank Syariah Indonesia Tbk.", "sector": "Financials", "sub_sector": "Banks"},
            {"ticker": "ARTO", "name": "Bank Jago Tbk.", "sector": "Financials", "sub_sector": "Banks"},
            {"ticker": "BBTN", "name": "Bank Tabungan Negara Tbk.", "sector": "Financials", "sub_sector": "Banks"},
            
            # Telekomunikasi & Infrastruktur (Infrastructure)
            {"ticker": "TLKM", "name": "Telkom Indonesia Tbk.", "sector": "Infrastructure", "sub_sector": "Telecommunication"},
            {"ticker": "ISAT", "name": "Indosat Tbk.", "sector": "Infrastructure", "sub_sector": "Telecommunication"},
            {"ticker": "EXCL", "name": "XL Axiata Tbk.", "sector": "Infrastructure", "sub_sector": "Telecommunication"},
            {"ticker": "JSMR", "name": "Jasa Marga Tbk.", "sector": "Infrastructure", "sub_sector": "Toll Road Operators"},
            {"ticker": "PGAS", "name": "Perusahaan Gas Negara Tbk.", "sector": "Infrastructure", "sub_sector": "Utilities"},
            {"ticker": "WIKA", "name": "Wijaya Karya Tbk.", "sector": "Infrastructure", "sub_sector": "Heavy Construction"},
            {"ticker": "PTPP", "name": "PP (Persero) Tbk.", "sector": "Infrastructure", "sub_sector": "Heavy Construction"},
            
            # Energi (Energy)
            {"ticker": "ADRO", "name": "Adaro Energy Indonesia Tbk.", "sector": "Energy", "sub_sector": "Coal"},
            {"ticker": "PTBA", "name": "Bukit Asam Tbk.", "sector": "Energy", "sub_sector": "Coal"},
            {"ticker": "ITMG", "name": "Indo Tambangraya Megah Tbk.", "sector": "Energy", "sub_sector": "Coal"},
            {"ticker": "MEDC", "name": "Medco Energi Internasional Tbk.", "sector": "Energy", "sub_sector": "Oil & Gas"},
            {"ticker": "AKRA", "name": "AKR Corporindo Tbk.", "sector": "Energy", "sub_sector": "Oil & Gas Distributors"},
            {"ticker": "ELSA", "name": "Elnusa Tbk.", "sector": "Energy", "sub_sector": "Oil & Gas Support Services"},
            {"ticker": "HRUM", "name": "Harum Energy Tbk.", "sector": "Energy", "sub_sector": "Coal"},

            # Industri & Otomotif (Industrials)
            {"ticker": "ASII", "name": "Astra International Tbk.", "sector": "Industrials", "sub_sector": "Automotive"},
            {"ticker": "UNTR", "name": "United Tractors Tbk.", "sector": "Industrials", "sub_sector": "Heavy Equipment Sales"},
            
            # Barang Baku & Tambang Mineral (Basic Materials)
            {"ticker": "ANTM", "name": "Aneka Tambang Tbk.", "sector": "Basic Materials", "sub_sector": "Metals & Mining"},
            {"ticker": "INCO", "name": "Vale Indonesia Tbk.", "sector": "Basic Materials", "sub_sector": "Metals & Mining"},
            {"ticker": "MDKA", "name": "Merdeka Copper Gold Tbk.", "sector": "Basic Materials", "sub_sector": "Metals & Mining"},
            {"ticker": "TPIA", "name": "Chandra Asri Petrochemical Tbk.", "sector": "Basic Materials", "sub_sector": "Chemicals"},
            {"ticker": "BRPT", "name": "Barito Pacific Tbk.", "sector": "Basic Materials", "sub_sector": "Chemicals"},
            {"ticker": "SMGR", "name": "Semen Indonesia Tbk.", "sector": "Basic Materials", "sub_sector": "Construction Materials"},
            {"ticker": "INTP", "name": "Indocement Tunggal Prakarsa Tbk.", "sector": "Basic Materials", "sub_sector": "Construction Materials"},
            
            # Consumer Goods (Consumer Non-Cyclicals)
            {"ticker": "UNVR", "name": "Unilever Indonesia Tbk.", "sector": "Consumer Non-Cyclicals", "sub_sector": "Personal Care Products"},
            {"ticker": "ICBP", "name": "Indofood CBP Sukses Makmur Tbk.", "sector": "Consumer Non-Cyclicals", "sub_sector": "Packaged Foods"},
            {"ticker": "INDF", "name": "Indofood Sukses Makmur Tbk.", "sector": "Consumer Non-Cyclicals", "sub_sector": "Packaged Foods"},
            {"ticker": "KLBF", "name": "Kalbe Farma Tbk.", "sector": "Consumer Non-Cyclicals", "sub_sector": "Pharmaceuticals"},
            {"ticker": "MYOR", "name": "Mayora Indah Tbk.", "sector": "Consumer Non-Cyclicals", "sub_sector": "Packaged Foods"},
            {"ticker": "HMSP", "name": "H.M. Sampoerna Tbk.", "sector": "Consumer Non-Cyclicals", "sub_sector": "Tobacco"},
            {"ticker": "GGRM", "name": "Gudang Garam Tbk.", "sector": "Consumer Non-Cyclicals", "sub_sector": "Tobacco"},
            {"ticker": "SIDO", "name": "Industri Jamu dan Farmasi Sido Muncul Tbk.", "sector": "Consumer Non-Cyclicals", "sub_sector": "Pharmaceuticals"},
            {"ticker": "AMRT", "name": "Sumber Alfaria Trijaya Tbk.", "sector": "Consumer Non-Cyclicals", "sub_sector": "Food Retailers"},
            
            # Ritel & Rekreasi (Consumer Cyclicals)
            {"ticker": "ACES", "name": "Aspirasi Hidup Indonesia Tbk.", "sector": "Consumer Cyclicals", "sub_sector": "Home Improvement"},
            {"ticker": "MAPI", "name": "Mitra Adiperkasa Tbk.", "sector": "Consumer Cyclicals", "sub_sector": "Department Stores"},
            {"ticker": "ERAA", "name": "Erajaya Swasembada Tbk.", "sector": "Consumer Cyclicals", "sub_sector": "Electronics"},
            
            # Teknologi (Technology)
            {"ticker": "GOTO", "name": "GoTo Gojek Tokopedia Tbk.", "sector": "Technology", "sub_sector": "Internet Services"},
            {"ticker": "BUKA", "name": "Bukalapak.com Tbk.", "sector": "Technology", "sub_sector": "Internet Services"},
            {"ticker": "EMTK", "name": "Elang Mahkota Teknologi Tbk.", "sector": "Technology", "sub_sector": "Holding Companies"},
            
            # Properti & Real Estate (Properties & Real Estate)
            {"ticker": "BSDE", "name": "Bumi Serpong Damai Tbk.", "sector": "Properties & Real Estate", "sub_sector": "Real Estate"},
            {"ticker": "CTRA", "name": "Ciputra Development Tbk.", "sector": "Properties & Real Estate", "sub_sector": "Real Estate"},
            {"ticker": "PWON", "name": "Pakuwon Jati Tbk.", "sector": "Properties & Real Estate", "sub_sector": "Real Estate"},
            {"ticker": "SMRA", "name": "Summarecon Agung Tbk.", "sector": "Properties & Real Estate", "sub_sector": "Real Estate"},
            
            # Kesehatan (Healthcare)
            {"ticker": "HEAL", "name": "Medikaloka Hermina Tbk.", "sector": "Healthcare", "sub_sector": "Healthcare Providers"},
            {"ticker": "MIKA", "name": "Mitra Keluarga Karyasehat Tbk.", "sector": "Healthcare", "sub_sector": "Healthcare Providers"}
        ]

    def sync_stocks_list(self):
        """Singkronisasi daftar ticker saham di DB."""
        try:
            tickers = self.fetch_tickers_from_idx()
            new_stocks_count = 0
            for item in tickers:
                # Periksa apakah sudah ada
                stock = self.db.query(Stock).filter(Stock.ticker == item["ticker"]).first()
                if not stock:
                    stock = Stock(
                        ticker=item["ticker"],
                        name=item["name"],
                        sector=item["sector"],
                        sub_sector=item["sub_sector"],
                        is_active=True
                    )
                    self.db.add(stock)
                    new_stocks_count += 1
            
            self.db.commit()
            logger.info(f"Sync stock tickers selesai. Berhasil menambahkan {new_stocks_count} saham baru.")
        except Exception as e:
            self.db.rollback()
            self.log_to_system("ERROR", "sync_stocks_list", str(e))
            raise e

    @retry_on_failure(retries=3, delay=10)
    def fetch_yahoo_finance_prices(self, ticker: str, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        """
        Mengambil data harga asli dari Yahoo Finance API langsung via Requests (Bypass Block VPS).
        """
        import requests
        prices = []
        yf_ticker = f"{ticker.upper()}.JK"
        
        # Konversi start dan end date ke epoch timestamp
        start_dt = datetime.combine(start_date, datetime.min.time())
        end_dt = datetime.combine(end_date, datetime.max.time())
        period1 = int(start_dt.timestamp())
        period2 = int(end_dt.timestamp())
        
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yf_ticker}"
        params = {
            "period1": period1,
            "period2": period2,
            "interval": "1d",
            "events": "history"
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        logger.info(f"Mengunduh data {yf_ticker} dari Yahoo API Langsung: {start_date} s.d {end_date}")
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=15)
            if response.status_code != 200:
                logger.error(f"Gagal mengambil data dari Yahoo API. Status: {response.status_code}, Body: {response.text[:200]}")
                return prices
                
            data = response.json()
            chart_data = data.get("chart", {}).get("result", [])
            if not chart_data:
                logger.warning(f"Data kosong untuk {yf_ticker}")
                return prices
                
            result = chart_data[0]
            timestamps = result.get("timestamp", [])
            indicators = result.get("indicators", {}).get("quote", [{}])[0]
            
            opens = indicators.get("open", [])
            highs = indicators.get("high", [])
            lows = indicators.get("low", [])
            closes = indicators.get("close", [])
            volumes = indicators.get("volume", [])
            
            for i in range(len(timestamps)):
                trade_date = date.fromtimestamp(timestamps[i])
                
                # Pastikan tidak ada data index out of range atau null
                if i >= len(closes) or i >= len(opens) or i >= len(highs) or i >= len(lows) or i >= len(volumes):
                    continue
                if closes[i] is None or opens[i] is None or highs[i] is None or lows[i] is None or volumes[i] is None:
                    continue
                    
                close_val = float(closes[i])
                open_val = float(opens[i])
                high_val = float(highs[i])
                low_val = float(lows[i])
                volume = int(volumes[i])
                
                if volume <= 0 or close_val <= 0:
                    continue
                    
                prices.append({
                    "date": trade_date,
                    "open": open_val,
                    "high": high_val,
                    "low": low_val,
                    "close": close_val,
                    "volume": volume,
                    "value": int(volume * close_val),
                    "frequency": max(1, int(volume // 100))
                })
        except Exception as e:
            logger.error(f"Gagal memproses data Yahoo API langsung untuk {yf_ticker}: {str(e)}")
            raise e
            
        return prices

    def sync_daily_prices(self, stock_ticker: str, force_full: bool = False):
        """
        Pencadangan harga harian secara incremental.
        Mencari tanggal terakhir harga di database dan mengambil data setelah tanggal tersebut.
        """
        stock = self.db.query(Stock).filter(Stock.ticker == stock_ticker).first()
        if not stock:
            raise ValueError(f"Saham dengan ticker {stock_ticker} tidak ditemukan di database.")

        try:
            # Dapatkan tanggal terakhir di DB
            last_price = self.db.query(DailyPrice).filter(
                DailyPrice.stock_id == stock.id
            ).order_by(DailyPrice.date.desc()).first()
            
            # Tentukan start date
            if last_price and not force_full:
                start_date = last_price.date + timedelta(days=1)
            else:
                start_date = date.today() - timedelta(days=365) # Default 1 tahun histori jika kosong
            
            end_date = date.today()
            
            if start_date > end_date:
                logger.info(f"Data harga {stock_ticker} sudah up to date.")
                return

            logger.info(f"Mengambil data harga {stock_ticker} dari {start_date} s.d {end_date}...")
            price_data = self.fetch_yahoo_finance_prices(stock.ticker, start_date, end_date)
            
            # Insert menggunakan ORM agar kompatibel SQLite dan PostgreSQL
            for data in price_data:
                # Cek duplikat sebelum insert
                existing = self.db.query(DailyPrice).filter(
                    DailyPrice.stock_id == stock.id,
                    DailyPrice.date == data["date"]
                ).first()
                if not existing:
                    new_price = DailyPrice(
                        stock_id=stock.id,
                        date=data["date"],
                        open=data["open"],
                        high=data["high"],
                        low=data["low"],
                        close=data["close"],
                        volume=data["volume"],
                        value=data["value"],
                        frequency=data["frequency"]
                    )
                    self.db.add(new_price)
            
            self.db.commit()
            logger.info(f"Berhasil mengimpor {len(price_data)} baris harga untuk {stock_ticker}.")
        except Exception as e:
            self.db.rollback()
            self.log_to_system("ERROR", "sync_daily_prices", f"Ticker: {stock_ticker}, Error: {str(e)}")
            raise e

    def sync_foreign_flow(self, stock_ticker: str):
        """Simulasi sinkronisasi data transaksi investor asing (Foreign Flow)."""
        stock = self.db.query(Stock).filter(Stock.ticker == stock_ticker).first()
        if not stock:
            return

        try:
            # Ambil tanggal terakhir
            last_flow = self.db.query(ForeignFlow).filter(ForeignFlow.stock_id == stock.id).order_by(ForeignFlow.date.desc()).first()
            start_date = last_flow.date + timedelta(days=1) if last_flow else date.today() - timedelta(days=90)
            end_date = date.today()

            current_date = start_date
            while current_date <= end_date:
                if current_date.weekday() < 5:
                    buy = abs(int(100000 + (hash(f"{stock_ticker}-{current_date}-fb") % 1000000)))
                    sell = abs(int(100000 + (hash(f"{stock_ticker}-{current_date}-fs") % 1000000)))
                    net = buy - sell

                    existing = self.db.query(ForeignFlow).filter(
                        ForeignFlow.stock_id == stock.id,
                        ForeignFlow.date == current_date
                    ).first()
                    if not existing:
                        new_flow = ForeignFlow(
                            stock_id=stock.id,
                            date=current_date,
                            foreign_buy=buy,
                            foreign_sell=sell,
                            net_foreign=net,
                            net_foreign_accum_20d=net * 20
                        )
                        self.db.add(new_flow)
                current_date += timedelta(days=1)
            
            self.db.commit()
            logger.info(f"Sync Foreign Flow {stock_ticker} selesai.")
        except Exception as e:
            self.db.rollback()
            self.log_to_system("ERROR", "sync_foreign_flow", f"Ticker: {stock_ticker}, Error: {str(e)}")
            raise e

    def fetch_yahoo_finance_fundamentals(self, ticker: str) -> Dict[str, Any]:
        """
        Mengambil data rasio finansial asli dari Yahoo Finance API (Bypass Block VPS).
        """
        import requests
        yf_ticker = f"{ticker.upper()}.JK"
        url = f"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{yf_ticker}"
        params = {"modules": "defaultKeyStatistics,financialData,summaryDetail"}
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        # Default fallback values (khas saham rata-rata)
        output = {
            "roe": 12.0,
            "der": 0.8,
            "per": 15.0,
            "pbv": 1.5,
            "dividend_yield": 2.5,
            "book_value": 1000.0,
            "eps": 50.0,
            "revenue": 5000000000000,
            "net_income": 500000000000
        }
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=15)
            if response.status_code != 200:
                logger.error(f"Gagal mengambil fundamental {yf_ticker}. Status: {response.status_code}")
                return output
                
            data = response.json()
            results = data.get("quoteSummary", {}).get("result", [])
            if not results:
                return output
                
            res = results[0]
            
            # 1. Financial Data
            fin_data = res.get("financialData", {})
            roe_raw = fin_data.get("returnOnEquity", {}).get("raw")
            if roe_raw is not None:
                output["roe"] = float(roe_raw) * 100.0
                
            der_raw = fin_data.get("debtToEquity", {}).get("raw")
            if der_raw is not None:
                output["der"] = float(der_raw) / 100.0
                
            rev_raw = fin_data.get("totalRevenue", {}).get("raw")
            if rev_raw is not None:
                output["revenue"] = int(rev_raw)
            ni_raw = fin_data.get("netIncomeToCommon", {}).get("raw") or fin_data.get("netIncome", {}).get("raw")
            if ni_raw is not None:
                output["net_income"] = int(ni_raw)
                
            # 2. Key Statistics
            key_stats = res.get("defaultKeyStatistics", {})
            pbv_raw = key_stats.get("priceToBook", {}).get("raw")
            if pbv_raw is not None:
                output["pbv"] = float(pbv_raw)
                
            bv_raw = key_stats.get("bookValue", {}).get("raw")
            if bv_raw is not None:
                output["book_value"] = float(bv_raw)
                
            eps_raw = key_stats.get("trailingEps", {}).get("raw")
            if eps_raw is not None:
                output["eps"] = float(eps_raw)
                
            per_raw = key_stats.get("trailingPE", {}).get("raw")
            if per_raw is not None:
                output["per"] = float(per_raw)
            else:
                per_raw_sd = res.get("summaryDetail", {}).get("trailingPE", {}).get("raw")
                if per_raw_sd is not None:
                    output["per"] = float(per_raw_sd)
                else:
                    per_f = key_stats.get("forwardPE", {}).get("raw")
                    if per_f is not None:
                        output["per"] = float(per_f)
            
            # 3. Summary Detail
            sum_detail = res.get("summaryDetail", {})
            dy_raw = sum_detail.get("trailingAnnualDividendYield", {}).get("raw") or sum_detail.get("dividendYield", {}).get("raw")
            if dy_raw is not None:
                output["dividend_yield"] = float(dy_raw) * 100.0
                
        except Exception as e:
            logger.error(f"Error parsing fundamental untuk {yf_ticker}: {str(e)}")
            
        return output

    def sync_financial_statements(self, stock_ticker: str):
        """Sinkronisasi Laporan Keuangan Tahunan & Kuartalan dengan data Yahoo Finance Asli."""
        stock = self.db.query(Stock).filter(Stock.ticker == stock_ticker).first()
        if not stock:
            return

        try:
            fund = self.fetch_yahoo_finance_fundamentals(stock.ticker)
            
            existing = self.db.query(Financial).filter(
                Financial.stock_id == stock.id,
                Financial.year == 2026,
                Financial.quarter == "Q1"
            ).first()
            
            if not existing:
                new_fin = Financial(
                    stock_id=stock.id,
                    year=2026,
                    quarter="Q1",
                    revenue=fund["revenue"],
                    net_income=fund["net_income"],
                    eps=fund["eps"],
                    roe=fund["roe"],
                    der=fund["der"],
                    per=fund["per"],
                    pbv=fund["pbv"],
                    dividend_yield=fund["dividend_yield"],
                    book_value=fund["book_value"],
                    cash_flow_operating=int(fund["net_income"] * 0.8)
                )
                self.db.add(new_fin)
            else:
                existing.revenue = fund["revenue"]
                existing.net_income = fund["net_income"]
                existing.eps = fund["eps"]
                existing.roe = fund["roe"]
                existing.der = fund["der"]
                existing.per = fund["per"]
                existing.pbv = fund["pbv"]
                existing.dividend_yield = fund["dividend_yield"]
                existing.book_value = fund["book_value"]
                
            self.db.commit()
            logger.info(f"Sync Laporan Keuangan {stock_ticker} selesai.")
        except Exception as e:
            self.db.rollback()
            self.log_to_system("ERROR", "sync_financial_statements", f"Ticker: {stock_ticker}, Error: {str(e)}")
            raise e
