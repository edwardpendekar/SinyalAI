import logging
import pandas as pd
import numpy as np
from datetime import date, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.models import Stock, DailyPrice, TechnicalIndicator, Financial, ForeignFlow, ScannerResult

logger = logging.getLogger("ScreeningEngine")
logger.setLevel(logging.INFO)

class AIScreeningEngine:
    def __init__(self, db: Session):
        self.db = db

    def run_screening_and_scoring(self, target_date: date = None):
        """
        Menjalankan proses screening dan scoring AI untuk seluruh emiten aktif di BEI.
        """
        if not target_date:
            target_date = date.today()

        logger.info(f"ScreeningEngine: Memulai pemindaian AI untuk tanggal {target_date}...")
        
        # Ambil daftar saham aktif
        stocks = self.db.query(Stock).filter(Stock.is_active == True).all()
        
        for stock in stocks:
            try:
                # 1. Ambil data historis harga (30 bar terakhir untuk hitung MA volume)
                prices = self.db.query(DailyPrice).filter(
                    DailyPrice.stock_id == stock.id,
                    DailyPrice.date <= target_date
                ).order_by(DailyPrice.date.desc()).limit(30).all()

                if not prices or len(prices) < 20:
                    continue # Lewati jika data tidak cukup untuk indikator volume
                
                prices = list(reversed(prices)) # Urutkan dari terlama ke terbaru
                df_prices = pd.DataFrame([{
                    "close": float(p.close),
                    "volume": p.volume,
                    "value": p.value,
                    "date": p.date
                } for p in prices])

                latest_close = df_prices["close"].iloc[-1]
                latest_volume = df_prices["volume"].iloc[-1]

                # Rata-rata transaksi harian 20 hari
                avg_transaction_value = df_prices["value"].iloc[-20:].mean()
                
                # SMA 20 Volume & Relative Volume
                sma20_volume = df_prices["volume"].iloc[-20:].mean()
                rvol = latest_volume / (sma20_volume + 1e-10)

                # 2. Ambil data indikator teknikal terbaru
                ti = self.db.query(TechnicalIndicator).filter(
                    TechnicalIndicator.stock_id == stock.id,
                    TechnicalIndicator.date == target_date
                ).first()

                # 3. Ambil data finansial terbaru
                fin = self.db.query(Financial).filter(
                    Financial.stock_id == stock.id
                ).order_by(Financial.year.desc(), Financial.quarter.desc()).first()

                # Ambil data finansial tahun/periode sebelumnya untuk menghitung growth
                fin_prev = None
                if fin:
                    # Ambil data pembanding (Q1 vs Q1 tahun lalu atau FY vs FY tahun lalu)
                    fin_prev = self.db.query(Financial).filter(
                        Financial.stock_id == stock.id,
                        Financial.year == fin.year - 1,
                        Financial.quarter == fin.quarter
                    ).first()

                # 4. Ambil data foreign flow terbaru
                ff = self.db.query(ForeignFlow).filter(
                    ForeignFlow.stock_id == stock.id,
                    ForeignFlow.date == target_date
                ).first()

                # 5. Ambil data deteksi divergensi dari scanner_results
                scanner_res = self.db.query(ScannerResult).filter(
                    ScannerResult.stock_id == stock.id,
                    ScannerResult.date == target_date
                ).first()

                # Cek ketersediaan data teknikal dasar
                if not ti:
                    continue

                # ------------------------------------------
                # EVALUASI KONDISI SCREENER & BOBOT SKOR AI
                # ------------------------------------------
                passed_conditions = []
                score = 0

                # --- 1. TREND CATEGORY (Bobot 25%) ---
                trend_passed = 0
                if latest_close > float(ti.sma_50 if ti.sma_50 else 0):
                    passed_conditions.append("Close > MA50")
                    trend_passed += 5
                if latest_close > float(ti.sma_200 if ti.sma_200 else 0):
                    passed_conditions.append("Close > MA200")
                    trend_passed += 10
                if float(ti.sma_50 if ti.sma_50 else 0) > float(ti.sma_200 if ti.sma_200 else 0):
                    passed_conditions.append("MA50 > MA200 (Golden Cross)")
                    trend_passed += 10
                score += trend_passed

                # --- 2. MOMENTUM CATEGORY (Bobot 20%) ---
                # Periksa divergensi dari tabel scanner_results
                momentum_passed = 0
                has_rsi_div = False
                has_macd_div = False

                if scanner_res and scanner_res.conditions_passed:
                    divergences = scanner_res.conditions_passed.get("divergences", [])
                    for div in divergences:
                        if div["type"] == "Hidden Bullish":
                            if div["indicator"] == "rsi":
                                has_rsi_div = True
                            elif div["indicator"] in ["macd", "macd_hist"]:
                                has_macd_div = True

                if has_rsi_div:
                    passed_conditions.append("Hidden Bullish RSI")
                    momentum_passed += 10
                if has_macd_div:
                    passed_conditions.append("Hidden Bullish MACD")
                    momentum_passed += 10
                score += momentum_passed

                # --- 3. VOLUME CATEGORY (Bobot 10%) ---
                volume_passed = 0
                if latest_volume > sma20_volume:
                    passed_conditions.append("Volume > SMA20 Volume")
                    volume_passed += 5
                if rvol > 1.2:
                    passed_conditions.append(f"Relative Volume > 1.2 (RVOL: {rvol:.2f})")
                    volume_passed += 5
                score += volume_passed

                # --- 4. FOREIGN FLOW CATEGORY (Bobot 10%) ---
                foreign_passed = 0
                if ff and ff.net_foreign > 0:
                    passed_conditions.append("Foreign Buy Positive")
                    foreign_passed += 10
                score += foreign_passed

                # --- 5. FUNDAMENTAL CATEGORY (Bobot 25%) ---
                fundamental_passed = 0
                if fin:
                    roe = float(fin.roe if fin.roe else 0)
                    per = float(fin.per if fin.per else 999)
                    pbv = float(fin.pbv if fin.pbv else 999)
                    
                    if roe > 15:
                        passed_conditions.append(f"ROE > 15% (ROE: {roe:.1f}%)")
                        fundamental_passed += 7
                    if per < 15:
                        passed_conditions.append(f"PER < 15 (PER: {per:.1f})")
                        fundamental_passed += 6
                    if pbv < 2:
                        passed_conditions.append(f"PBV < 2 (PBV: {pbv:.1f})")
                        fundamental_passed += 6
                    
                    # Growth Calculation (YoY)
                    rev_growth = 0
                    eps_growth = 0
                    if fin_prev and fin_prev.revenue and fin_prev.eps:
                        rev_growth = ((fin.revenue - fin_prev.revenue) / fin_prev.revenue) * 100
                        eps_growth = ((fin.eps - fin_prev.eps) / fin_prev.eps) * 100

                    if rev_growth > 10 or eps_growth > 5:
                        passed_conditions.append(f"Growth YoY (Rev: {rev_growth:.1f}%, EPS: {eps_growth:.1f}%)")
                        fundamental_passed += 6
                score += fundamental_passed

                # --- 6. DIVIDEND CATEGORY (Bobot 5%) ---
                dividend_passed = 0
                if fin and fin.dividend_yield and float(fin.dividend_yield) > 3.0:
                    passed_conditions.append(f"Dividend Yield > 3% (Yield: {fin.dividend_yield:.1f}%)")
                    dividend_passed += 5
                score += dividend_passed

                # --- 7. RISK CATEGORY (Bobot 5%) ---
                risk_passed = 0
                if fin and fin.der and float(fin.der) < 1.0:
                    passed_conditions.append(f"DER < 1 (DER: {fin.der:.2f})")
                    risk_passed += 5
                score += risk_passed

                # --- LIKUIDITAS DAN MARKET CAP FILTER (Pre-requisites) ---
                # Emiten harus memiliki market cap > 2 Triliun dan volume transaksi > 10 Milyar per hari
                market_cap_passed = stock.market_cap and stock.market_cap > 2000000000000
                liquidity_passed = avg_transaction_value > 10000000000

                if market_cap_passed:
                    passed_conditions.append(f"Market Cap > 2 Trillion (Cap: {stock.market_cap/1e12:.1f}T)")
                if liquidity_passed:
                    passed_conditions.append(f"Avg Transaction > 10 Billion (Avg: {avg_transaction_value/1e9:.1f}B)")

                # Jika tidak memenuhi pre-requisite, kurangi score secara signifikan
                if not market_cap_passed or not liquidity_passed:
                    score = int(score * 0.5)

                # ------------------------------------------
                # PERHITUNGAN OUTPUT KEPUTUSAN AI
                # ------------------------------------------
                
                # A. Rekomendasi
                if score >= 80:
                    recommendation = "Strong Buy"
                elif score >= 60:
                    recommendation = "Buy"
                elif score >= 40:
                    recommendation = "Hold"
                else:
                    recommendation = "Avoid"

                # B. Estimasi Target Price (Gabungan PBV & PER historis sederhana)
                target_price = None
                expected_return = None
                risk_reward_ratio = None
                stop_loss = None

                if fin and fin.book_value and fin.eps:
                    # Estimasi target harga wajar: PBV = 2.0 dan PER = 15.0
                    target_pbv = float(fin.book_value) * 2.0
                    target_per = float(fin.eps) * 15.0
                    target_price = (target_pbv + target_per) / 2.0
                    
                    if target_price > latest_close:
                        expected_return = ((target_price - latest_close) / latest_close) * 100
                    else:
                        expected_return = 0.0

                    # C. Stop Loss & Risk Reward (Berdasarkan ATR volatilitas)
                    atr_val = float(ti.atr if ti.atr else latest_close * 0.05)
                    stop_loss = latest_close - (2 * atr_val) # Stop loss 2x ATR di bawah harga close
                    
                    risk_amount = latest_close - stop_loss
                    reward_amount = target_price - latest_close
                    risk_reward_ratio = reward_amount / (risk_amount + 1e-10)

                # D. Hitung Risk Level & Position Sizing (Kriteria Prompt 7)
                der_val = float(fin.der) if (fin and fin.der) else 999.0
                if der_val > 1.5 or score < 40:
                    risk_level = "High"
                elif der_val < 1.0 and score >= 60:
                    risk_level = "Low"
                else:
                    risk_level = "Medium"

                if recommendation == "Strong Buy":
                    position_size = "10% of portfolio"
                elif recommendation == "Buy":
                    position_size = "5% of portfolio"
                else:
                    position_size = "0% (No position)"

                # E. Simpan hasil scanner
                existing_res = self.db.query(ScannerResult).filter(
                    ScannerResult.stock_id == stock.id,
                    ScannerResult.date == target_date
                ).first()

                # Simpan list kondisi yang dipenuhi
                json_data = {
                    "conditions_passed": passed_conditions,
                    "avg_daily_transaction": float(avg_transaction_value),
                    "relative_volume": float(rvol),
                    "risk_level": risk_level,
                    "position_size": position_size
                }
                
                # Jika sebelumnya ada divergensi, gabungkan kembali
                if scanner_res and scanner_res.conditions_passed:
                    divergences = scanner_res.conditions_passed.get("divergences", [])
                    if divergences:
                        json_data["divergences"] = divergences

                if existing_res:
                    existing_res.ai_score = int(score)
                    existing_res.conditions_passed = json_data
                    existing_res.recommendation = recommendation
                    existing_res.target_price = target_price
                    existing_res.stop_loss = stop_loss
                    existing_res.expected_return = expected_return
                    existing_res.risk_reward_ratio = risk_reward_ratio
                else:
                    new_res = ScannerResult(
                        stock_id=stock.id,
                        date=target_date,
                        ai_score=int(score),
                        conditions_passed=json_data,
                        recommendation=recommendation,
                        target_price=target_price,
                        stop_loss=stop_loss,
                        expected_return=expected_return,
                        risk_reward_ratio=risk_reward_ratio
                    )
                    self.db.add(new_res)
                    
            except Exception as e:
                logger.error(f"Gagal melakukan screening untuk {stock.ticker}: {str(e)}")
                continue

        self.db.commit()
        logger.info(f"ScreeningEngine: Pemindaian AI selesai untuk tanggal {target_date}.")
