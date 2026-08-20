import os
import logging
import urllib.request
import json
from datetime import date
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.models import Stock, DailyPrice, TechnicalIndicator, Financial, ForeignFlow, ScannerResult

logger = logging.getLogger("AIAnalysis")
logger.setLevel(logging.INFO)

class AIAnalysisService:
    def __init__(self, db: Session):
        self.db = db
        # Ambil API key dari environment
        self.api_key = os.getenv("GEMINI_API_KEY", "")

    def calculate_dcf_valuation(self, fcf: float, shares: float, growth_rate: float = 0.08, discount_rate: float = 0.10) -> float:
        """Kalkulasi nilai intrinsik per saham menggunakan model DCF 5 tahun."""
        if not fcf or fcf <= 0 or not shares or shares <= 0:
            return 0.0
        
        projected_fcf = []
        val = fcf
        # Proyeksi 5 tahun FCF
        for _ in range(5):
            val *= (1 + growth_rate)
            projected_fcf.append(val)
        
        # Diskonto FCF
        discounted_fcf = []
        for i, val in enumerate(projected_fcf):
            discounted_fcf.append(val / ((1 + discount_rate) ** (i + 1)))
            
        # Terminal Value (Gordon Growth Model: Terminal growth rate = 4%)
        terminal_growth = 0.04
        terminal_val = (projected_fcf[-1] * (1 + terminal_growth)) / (discount_rate - terminal_growth)
        discounted_tv = terminal_val / ((1 + discount_rate) ** 5)
        
        intrinsic_value = sum(discounted_fcf) + discounted_tv
        return intrinsic_value / shares

    def generate_stock_report_data(self, ticker: str) -> Dict[str, Any]:
        """Mengumpulkan data kuantitatif dari DB untuk disuplai ke AI."""
        stock = self.db.query(Stock).filter(Stock.ticker == ticker).first()
        if not stock:
            raise ValueError(f"Stock {ticker} tidak ditemukan.")

        latest_price = self.db.query(DailyPrice).filter(DailyPrice.stock_id == stock.id).order_by(DailyPrice.date.desc()).first()
        latest_indicator = self.db.query(TechnicalIndicator).filter(TechnicalIndicator.stock_id == stock.id).order_by(TechnicalIndicator.date.desc()).first()
        latest_fin = self.db.query(Financial).filter(Financial.stock_id == stock.id).order_by(Financial.year.desc(), Financial.quarter.desc()).first()
        latest_ff = self.db.query(ForeignFlow).filter(ForeignFlow.stock_id == stock.id).order_by(ForeignFlow.date.desc()).first()
        latest_scan = self.db.query(ScannerResult).filter(ScannerResult.stock_id == stock.id).order_by(ScannerResult.date.desc()).first()

        close_price = float(latest_price.close) if latest_price else 0.0
        shares = float(stock.shares_outstanding) if stock.shares_outstanding else 1.0
        fcf = float(latest_fin.cash_flow_operating) if (latest_fin and latest_fin.cash_flow_operating) else float(latest_fin.net_income) if (latest_fin and latest_fin.net_income) else 0.0
        
        # Hitung DCF intrinsik
        dcf_intrinsic = self.calculate_dcf_valuation(fcf, shares)
        
        # Target PER & PBV
        pbv_intrinsic = float(latest_fin.book_value) * 2.0 if (latest_fin and latest_fin.book_value) else 0.0
        per_intrinsic = float(latest_fin.eps) * 15.0 if (latest_fin and latest_fin.eps) else 0.0

        return {
            "ticker": stock.ticker,
            "name": stock.name,
            "sector": stock.sector,
            "sub_sector": stock.sub_sector,
            "market_cap": stock.market_cap,
            "close_price": close_price,
            "dcf_intrinsic": dcf_intrinsic,
            "pbv_intrinsic": pbv_intrinsic,
            "per_intrinsic": per_intrinsic,
            "roe": float(latest_fin.roe) if (latest_fin and latest_fin.roe) else 0.0,
            "der": float(latest_fin.der) if (latest_fin and latest_fin.der) else 0.0,
            "per": float(latest_fin.per) if (latest_fin and latest_fin.per) else 0.0,
            "pbv": float(latest_fin.pbv) if (latest_fin and latest_fin.pbv) else 0.0,
            "eps": float(latest_fin.eps) if (latest_fin and latest_fin.eps) else 0.0,
            "yield": float(latest_fin.dividend_yield) if (latest_fin and latest_fin.dividend_yield) else 0.0,
            "net_foreign": latest_ff.net_foreign if latest_ff else 0,
            "rsi": float(latest_indicator.rsi) if (latest_indicator and latest_indicator.rsi) else 50.0,
            "macd": float(latest_indicator.macd) if (latest_indicator and latest_indicator.macd) else 0.0,
            "ai_score": latest_scan.ai_score if latest_scan else 0,
            "recommendation": latest_scan.recommendation if latest_scan else "Hold"
        }

    def generate_fall_back_report(self, data: Dict[str, Any]) -> str:
        """Fungsi fallback jika API Key Gemini tidak diset. Menghasilkan template Markdown algoritmik."""
        target_price = (data["dcf_intrinsic"] + data["per_intrinsic"] + data["pbv_intrinsic"]) / 3.0 if data["dcf_intrinsic"] > 0 else (data["per_intrinsic"] + data["pbv_intrinsic"]) / 2.0
        
        return f"""# AI Stock Analysis Report: {data['ticker']} ({data['name']})
**Tanggal Analisis:** {date.today().strftime('%Y-%m-%d')}
**Sektor:** {data['sector']} | **Sub-Sektor:** {data['sub_sector']}
**AI Score:** `{data['ai_score']}/100` ({data['recommendation']})

---

## 1. Business Summary
{data['name']} ({data['ticker']}) merupakan emiten terkemuka yang bergerak di sektor {data['sector']}, secara spesifik pada industri {data['sub_sector']}. Dengan kapitalisasi pasar sebesar Rp {data['market_cap'] or 0:,.0f}, emiten ini memegang peranan penting di dalam perkembangan indeks harga saham BEI.

## 2. Technical Analysis
*   **RSI (14):** {data['rsi']:.2f} ({'Oversold' if data['rsi'] < 30 else 'Overbought' if data['rsi'] > 70 else 'Neutral/Bullish' if data['rsi'] > 50 else 'Neutral/Bearish'})
*   **MACD:** {data['macd']:.4f}
*   **Kondisi Tren:** Harga saat ini diperdagangkan pada level Rp {data['close_price']:,.0f}. Sinyal AI memposisikan emiten ini dengan rekomendasi umum **{data['recommendation']}**.

## 3. Fundamental Analysis
*   **Return on Equity (ROE):** {data['roe']:.2f}% (Kemampuan profitabilitas {'Sangat Sehat' if data['roe'] > 15 else 'Moderat'})
*   **Debt to Equity Ratio (DER):** {data['der']:.2f}x (Leverage risiko utang {'Rendah & Aman' if data['der'] < 1.0 else 'Tinggi'})
*   **EPS:** Rp {data['eps']:.2f}

## 4. Valuation
*   **Intrinsic Value (DCF):** Rp {data['dcf_intrinsic']:,.2f}
*   **PER-based Fair Price (PER=15x):** Rp {data['per_intrinsic']:,.2f} (Current PER: {data['per']:.2f}x)
*   **PBV-based Fair Price (PBV=2x):** Rp {data['pbv_intrinsic']:,.2f} (Current PBV: {data['pbv']:.2f}x)
*   **Konsensus Target Harga AI:** **Rp {target_price:,.2f}**

## 5. Dividend Analysis
Emiten memiliki Dividend Yield sebesar **{data['yield']:.2f}%**. Ini mencerminkan rasio pengembalian dividen yang {'menarik bagi investor jangka panjang' if data['yield'] > 3.0 else 'moderat/rendah'}.

## 6. Risk Analysis
*   **Finansial:** DER sebesar {data['der']:.2f}x menunjukkan struktur hutang yang relatif {'terkendali' if data['der'] < 1.0 else 'tinggi'}.
*   **Valuasi:** Harga pasar saat ini Rp {data['close_price']:,.0f} dibandingkan konsensus wajar Rp {target_price:,.0f} mencerminkan Margin of Safety (MoS) sebesar {((target_price - data['close_price'])/target_price * 100):.1f}% jika target tercapai.

## 7. Catalyst & Recommendation
*   **Katalis:** Arus akumulasi dana asing harian tercatat Rp {data['net_foreign']:,.0f}. Sentimen pasar sektoral menunjukkan potensi apresiasi nilai.
*   **Rekomendasi Akhir:** **{data['recommendation']}** dengan Target Harga Rp **{target_price:,.2f}**.
"""

    def generate_ai_report(self, ticker: str) -> str:
        """
        Menghasilkan laporan analisis lengkap dalam format Markdown.
        Menggunakan Gemini API jika kunci API tersedia; jika tidak, menggunakan mesin template internal.
        """
        data = self.generate_stock_report_data(ticker)

        if not self.api_key:
            logger.info("GEMINI_API_KEY tidak diset. Menggunakan generator laporan fallback.")
            return self.generate_fall_back_report(data)

        # Prompt untuk AI (Gemini)
        prompt = f"""
        Tulis laporan analisis saham profesional berbahasa Indonesia untuk emiten berikut:
        Ticker: {data['ticker']}
        Nama: {data['name']}
        Sektor: {data['sector']} / {data['sub_sector']}
        Harga Close: Rp {data['close_price']:,.0f}
        Kapitalisasi Pasar: Rp {data['market_cap'] or 0:,.0f}
        
        Kalkulasi Valuasi Kuantitatif Internal:
        - Nilai Intrinsik DCF: Rp {data['dcf_intrinsic']:,.2f}
        - Harga Wajar Berbasis PBV (Target 2x): Rp {data['pbv_intrinsic']:,.2f} (Current PBV: {data['pbv']:.2f}x)
        - Harga Wajar Berbasis PER (Target 15x): Rp {data['per_intrinsic']:,.2f} (Current PER: {data['per']:.2f}x)
        
        Statistik Keuangan Utama:
        - ROE: {data['roe']:.2f}%
        - DER: {data['der']:.2f}x
        - EPS: Rp {data['eps']:.2f}
        - Dividend Yield: {data['yield']:.2f}%
        
        Indikator Teknikal & Sentimen:
        - RSI (14): {data['rsi']:.2f}
        - MACD: {data['macd']:.4f}
        - Net Foreign Buy Harian: Rp {data['net_foreign']:,.0f}
        - AI Score: {data['ai_score']}/100
        - Rekomendasi Sistem: {data['recommendation']}

        Buat dalam format markdown dengan judul-judul:
        # AI Stock Analysis Report: [Ticker] - [Nama Emiten]
        ## 1. Business Summary
        ## 2. Technical Analysis
        ## 3. Fundamental Analysis
        ## 4. Valuation (Bahas DCF, PER, PBV secara komparatif dengan harga close saat ini)
        ## 5. Dividend Analysis
        ## 6. Risk Analysis
        ## 7. Catalyst
        ## 8. Recommendation & Target Price

        Pastikan nada bahasanya formal, analitis layaknya analis pasar modal senior, dan berikan kesimpulan target harga kuantitatif yang jelas berdasarkan konsensus perhitungan di atas.
        """

        try:
            # HTTP request langsung ke Gemini API untuk menjaga kesederhanaan tanpa library external
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={self.api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            }

            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=30) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                markdown_output = res_body["candidates"][0]["content"]["parts"][0]["text"]
                return markdown_output
        except Exception as e:
            logger.error(f"Gagal memanggil Gemini API: {str(e)}. Fallback ke template generator.")
            return self.generate_fall_back_report(data)
