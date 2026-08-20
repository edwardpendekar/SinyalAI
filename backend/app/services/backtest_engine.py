import logging
import numpy as np
import pandas as pd
from datetime import date, datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.models import Stock, DailyPrice, TechnicalIndicator

logger = logging.getLogger("BacktestEngine")
logger.setLevel(logging.INFO)

class BacktestEngine:
    def __init__(self, db: Session):
        self.db = db

    def calculate_metrics(self, trades: List[Dict[str, Any]], initial_capital: float = 100000000.0) -> Dict[str, Any]:
        """
        Menghitung seluruh metrik performansi portofolio berdasarkan log perdagangan.
        Metrik: Win Rate, Sharpe, Sortino, Profit Factor, MDD, Expectancy, Avg Holding Days.
        """
        if not trades:
            return {
                "total_trades": 0,
                "win_rate": 0.0,
                "sharpe_ratio": 0.0,
                "sortino_ratio": 0.0,
                "profit_factor": 0.0,
                "max_drawdown": 0.0,
                "expectancy": 0.0,
                "avg_holding_days": 0.0,
                "total_profit_pct": 0.0,
                "final_equity": initial_capital
            }

        df_trades = pd.DataFrame(trades)
        
        # 1. Klasifikasi Win/Loss
        df_trades["pnl"] = (df_trades["exit_price"] - df_trades["entry_price"]) * df_trades["qty"] * 100 # 1 Lot = 100 shares
        df_trades["pnl_pct"] = (df_trades["exit_price"] - df_trades["entry_price"]) / df_trades["entry_price"]
        
        total_trades = len(df_trades)
        wins = df_trades[df_trades["pnl"] > 0]
        losses = df_trades[df_trades["pnl"] <= 0]
        
        win_rate = len(wins) / total_trades if total_trades > 0 else 0.0
        
        # 2. Rata-rata Profit & Loss
        avg_win = wins["pnl"].mean() if not wins.empty else 0.0
        avg_loss = losses["pnl"].mean() if not losses.empty else 0.0
        loss_rate = 1.0 - win_rate
        
        # 3. Expectancy
        # Expectancy = (Win Rate * Avg Win) - (Loss Rate * Abs(Avg Loss))
        expectancy = (win_rate * avg_win) + (loss_rate * avg_loss) # Avg loss negatif, jadi ditambah

        # 4. Profit Factor
        gross_profit = wins["pnl"].sum() if not wins.empty else 0.0
        gross_loss = abs(losses["pnl"].sum()) if not losses.empty else 0.0
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else (gross_profit if gross_profit > 0 else 1.0)

        # 5. Average Holding Days
        df_trades["entry_date"] = pd.to_datetime(df_trades["entry_date"])
        df_trades["exit_date"] = pd.to_datetime(df_trades["exit_date"])
        df_trades["holding_days"] = (df_trades["exit_date"] - df_trades["entry_date"]).dt.days
        avg_holding_days = df_trades["holding_days"].mean()

        # 6. Hitung Runtutan Ekuitas & Max Drawdown
        equity = initial_capital
        equity_curve = [initial_capital]
        for _, trade in df_trades.iterrows():
            equity += trade["pnl"]
            equity_curve.append(equity)

        equity_series = pd.Series(equity_curve)
        peaks = equity_series.cummax()
        drawdowns = (equity_series - peaks) / peaks
        max_drawdown = drawdowns.min() # Nilai negatif paling rendah

        # 7. Sharpe & Sortino (Annualized dari return per trade)
        returns = df_trades["pnl_pct"]
        mean_ret = returns.mean()
        std_ret = returns.std()
        
        # Sharpe Ratio (Risk-free rate disimulasikan 6% per tahun, atau 0% per trade untuk simplifikasi)
        # Annualized factor = 252 (hari bursa), diasumsikan rata-rata holding days digunakan untuk adjustment
        annualizing_factor = np.sqrt(252 / (avg_holding_days + 1e-10))
        sharpe = (mean_ret / (std_ret + 1e-10)) * annualizing_factor if std_ret > 0 else 0.0

        # Sortino Ratio (Hanya deviasi return negatif)
        downside_returns = returns[returns < 0]
        downside_std = downside_returns.std()
        sortino = (mean_ret / (downside_std + 1e-10)) * annualizing_factor if downside_std > 0 else (sharpe if mean_ret > 0 else 0.0)

        return {
            "total_trades": total_trades,
            "win_rate": float(win_rate * 100),
            "sharpe_ratio": float(sharpe),
            "sortino_ratio": float(sortino),
            "profit_factor": float(profit_factor),
            "max_drawdown": float(max_drawdown * 100), # Dalam persen
            "expectancy": float(expectancy),
            "avg_holding_days": float(avg_holding_days),
            "total_profit_pct": float(((equity - initial_capital) / initial_capital) * 100),
            "final_equity": float(equity)
        }

    def run_monte_carlo_simulation(self, returns: List[float], num_simulations: int = 1000, num_days: int = 100) -> Dict[str, Any]:
        """
        Menjalankan Simulasi Monte Carlo sebanyak N kali untuk meramalkan ekuitas portofolio.
        Mengacak return harian/per-trade untuk melihat probabilitas kejatuhan ekuitas terburuk.
        """
        if not returns or len(returns) < 5:
            # Fallback jika tidak cukup data
            returns = [0.01, -0.005, 0.015, -0.01, 0.002, -0.008, 0.012]

        sim_results = np.zeros((num_simulations, num_days))
        initial_equity = 100.0 # Base index 100

        for sim in range(num_simulations):
            # Acak return secara berulang (bootstrapping)
            shuffled_returns = np.random.choice(returns, size=num_days, replace=True)
            equity_path = initial_equity * np.cumprod(1 + shuffled_returns)
            sim_results[sim, :] = equity_path

        # Ambil persentil hasil simulasi ekuitas di hari terakhir
        final_values = sim_results[:, -1]
        p95 = np.percentile(final_values, 95) # Hasil optimis
        p50 = np.percentile(final_values, 50) # Hasil median
        p5 = np.percentile(final_values, 5)   # Hasil pesimis (Worst Case)

        # Hitung Probabilitas drawdown > 20%
        drawdowns = []
        for sim in range(num_simulations):
            path = sim_results[sim, :]
            peak = np.maximum.accumulate(path)
            dd = (path - peak) / peak
            drawdowns.append(dd.min())
        
        prob_mdd_20 = sum(1 for dd in drawdowns if dd <= -0.20) / num_simulations * 100

        return {
            "p95_optimistic": float(p95),
            "p50_median": float(p50),
            "p5_pesimistic": float(p5),
            "probability_drawdown_20pct": float(prob_mdd_20)
        }

    def run_backtest_strategy(
        self, 
        ticker: str, 
        start_date: date, 
        end_date: date,
        min_ai_score: int = 70
    ) -> Dict[str, Any]:
        """
        Simulasi pengujian historis (Backtest) strategi Sinyal Saham AI:
        - Entry: Beli jika AI Score >= min_ai_score
        - Exit: Jual jika AI Score jatuh di bawah 45 atau terpicu Stop Loss 2x ATR.
        """
        stock = self.db.query(Stock).filter(Stock.ticker == ticker).first()
        if not stock:
            raise ValueError(f"Stock {ticker} tidak terdaftar.")

        # Ambil gabungan data harga, ATR, dan AI score
        sql = text("""
            SELECT p.date, p.open, p.high, p.low, p.close, ti.atr, sr.ai_score
            FROM daily_prices p
            LEFT JOIN technical_indicators ti ON p.stock_id = ti.stock_id AND p.date = ti.date
            LEFT JOIN scanner_results sr ON p.stock_id = sr.stock_id AND p.date = sr.date
            WHERE p.stock_id = :stock_id AND p.date BETWEEN :start_date AND :end_date
            ORDER BY p.date ASC;
        """)
        
        rows = self.db.execute(sql, {
            "stock_id": stock.id,
            "start_date": start_date,
            "end_date": end_date
        }).fetchall()

        if not rows or len(rows) < 10:
            return {"error": "Data historis tidak mencukupi untuk melakukan backtesting."}

        # Jalankan mesin simulasi dagang
        in_position = False
        entry_price = 0.0
        entry_date = None
        atr_at_entry = 0.0
        trades = []
        equity = 100000000.0 # Modal awal 100 juta
        qty_lot = 0

        for row in rows:
            date_val = row.date
            close_val = float(row.close)
            atr_val = float(row.atr) if row.atr else close_val * 0.05
            score_val = row.ai_score if row.ai_score else 0

            # Evaluasi Exit jika sedang memegang barang
            if in_position:
                # Batas stop loss dinamis (2x ATR di bawah entry)
                stop_loss = entry_price - (2 * atr_at_entry)
                
                # Jual jika kena stop loss ATAU AI score jatuh di bawah 45 (Sinyal Avoid)
                if close_val <= stop_loss or score_val < 45:
                    trades.append({
                        "entry_date": entry_date,
                        "entry_price": entry_price,
                        "exit_date": date_val,
                        "exit_price": close_val,
                        "qty": qty_lot,
                        "reason": "Stop Loss" if close_val <= stop_loss else "Score Drop"
                    })
                    in_position = False

            # Evaluasi Entry jika sedang pegang cash
            else:
                # Beli jika AI score memenuhi syarat
                if score_val >= min_ai_score:
                    entry_price = close_val
                    entry_date = date_val
                    atr_at_entry = atr_val
                    # Beli maksimum modal (95% modal dibelikan lot saham)
                    qty_lot = int((equity * 0.95) // (entry_price * 100))
                    if qty_lot > 0:
                        in_position = True

        # Jika masih ada barang di akhir periode, jual paksa di hari terakhir
        if in_position:
            last_row = rows[-1]
            trades.append({
                "entry_date": entry_date,
                "entry_price": entry_price,
                "exit_date": last_row.date,
                "exit_price": float(last_row.close),
                "qty": qty_lot,
                "reason": "End of Period"
            })

        # Hitung metrik performa perdagangan
        metrics = self.calculate_metrics(trades, initial_capital=100000000.0)
        
        # Jalankan Monte Carlo
        returns_list = [t["pnl_pct"] for t in trades] if trades else [0.0]
        monte_carlo = self.run_monte_carlo_simulation(returns_list)
        
        return {
            "ticker": ticker,
            "metrics": metrics,
            "monte_carlo": monte_carlo,
            "trades_log": [
                {
                    "entry_date": t["entry_date"].strftime("%Y-%m-%d"),
                    "entry_price": t["entry_price"],
                    "exit_date": t["exit_date"].strftime("%Y-%m-%d"),
                    "exit_price": t["exit_price"],
                    "qty": t["qty"],
                    "pnl": (t["exit_price"] - t["entry_price"]) * t["qty"] * 100,
                    "reason": t["reason"]
                }
                for t in trades
            ]
        }

    def generate_backtest_report_markdown(self, res: Dict[str, Any]) -> str:
        """Membuat dokumen laporan hasil backtesting komprehensif."""
        if "error" in res:
            return f"### Error: {res['error']}"

        m = res["metrics"]
        mc = res["monte_carlo"]

        report = f"""# BACKTEST PERFORMANCE REPORT: {res['ticker']}
**Periode Simulasi:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Modal Awal:** Rp 100,000,000

---

## 1. Analisis Metrik Portofolio
| Nama Metrik | Hasil Evaluasi | Deskripsi Metrik |
| :--- | :--- | :--- |
| **Total Trades** | {m['total_trades']} kali | Frekuensi transaksi selama periode |
| **Win Rate** | **{m['win_rate']:.2f}%** | Persentase transaksi menghasilkan profit |
| **Final Equity** | **Rp {m['final_equity']:,.2f}** | Total nilai portofolio akhir |
| **Net Profit (%)** | **{m['total_profit_pct']:.2f}%** | Persentase keuntungan bersih portofolio |
| **Sharpe Ratio** | {m['sharpe_ratio']:.2f} | Efisiensi imbal hasil disesuaikan risiko |
| **Sortino Ratio** | {m['sortino_ratio']:.2f} | Imbal hasil disesuaikan risiko kejatuhan |
| **Profit Factor** | {m['profit_factor']:.2f} | Perbandingan total profit vs total loss |
| **Max Drawdown** | **{m['max_drawdown']:.2f}%** | Penurunan ekuitas terdalam dari peak |
| **Expectancy** | Rp {m['expectancy']:,.2f} | Ekspektasi profit bersih per trade |
| **Avg Holding Days**| {m['avg_holding_days']:.1f} hari | Rata-rata durasi memegang posisi |

---

## 2. Simulasi Proyeksi Monte Carlo (1,000 Iterasi)
Simulasi acak jalur ekuitas masa depan untuk menguji ketahanan strategi:
*   **Persentil 95 (Optimis):** {mc['p95_optimistic']:.2f} (Nilai akhir index jika pasar bullish)
*   **Persentil 50 (Median):** {mc['p50_median']:.2f} (Ekspektasi nilai tengah portofolio)
*   **Persentil 5 (Pesimis):** {mc['p5_pesimistic']:.2f} (Ekspektasi terburuk jika pasar bearish)
*   **Probabilitas Ruin (Drawdown >= 20%):** **{mc['probability_drawdown_20pct']:.2f}%**

---

## 3. Log Perdagangan Lengkap (Trades Log)
"""
        # Tambahkan tabel trades log
        report += "| Entry Date | Entry Price | Exit Date | Exit Price | Qty (Lot) | PnL (Rp) | Exit Reason |\n"
        report += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n"
        
        for t in res["trades_log"]:
            report += f"| {t['entry_date']} | Rp {t['entry_price']:,.0f} | {t['exit_date']} | Rp {t['exit_price']:,.0f} | {t['qty']} | Rp {t['pnl']:,.0f} | {t['reason']} |\n"

        return report

    def run_walk_forward_analysis(
        self,
        ticker: str,
        start_date: date,
        end_date: date,
        train_days: int = 120,
        test_days: int = 30
    ) -> Dict[str, Any]:
        """
        Menjalankan analisis Walk Forward untuk mengevaluasi stabilitas parameter.
        Mencari parameter 'min_ai_score' optimal secara out-of-sample.
        """
        stock = self.db.query(Stock).filter(Stock.ticker == ticker).first()
        if not stock:
            raise ValueError(f"Stock {ticker} tidak terdaftar.")

        # Ambil harga harian lengkap
        sql = text("""
            SELECT p.date, p.open, p.high, p.low, p.close, ti.atr, sr.ai_score
            FROM daily_prices p
            LEFT JOIN technical_indicators ti ON p.stock_id = ti.stock_id AND p.date = ti.date
            LEFT JOIN scanner_results sr ON p.stock_id = sr.stock_id AND p.date = sr.date
            WHERE p.stock_id = :stock_id AND p.date BETWEEN :start_date AND :end_date
            ORDER BY p.date ASC;
        """)
        rows = self.db.execute(sql, {
            "stock_id": stock.id,
            "start_date": start_date,
            "end_date": end_date
        }).fetchall()

        if len(rows) < (train_days + test_days):
            return {"error": "Rentang tanggal data terlalu pendek untuk Walk Forward Analysis."}

        # Konversi ke df
        df = pd.DataFrame([dict(r._mapping) for r in rows])
        
        # Simulasi rolling window
        total_len = len(df)
        oos_trades = []
        
        step = test_days
        start_idx = 0
        
        while (start_idx + train_days + test_days) <= total_len:
            train_start = start_idx
            train_end = start_idx + train_days
            test_end = train_end + test_days
            
            df_train = df.iloc[train_start:train_end]
            df_test = df.iloc[train_end:test_end]
            
            # --- FASE OPTIMISASI IN-SAMPLE (Training) ---
            best_score_param = 70
            best_pnl = -999999999.0
            
            # Cari parameter 'min_ai_score' terbaik di antara 60, 70, 80
            for test_score in [60, 70, 80]:
                sim_trades = self._simulate_trading_on_df(df_train, min_ai_score=test_score)
                pnl = sum((t["exit_price"] - t["entry_price"]) * t["qty"] * 100 for t in sim_trades)
                if pnl > best_pnl:
                    best_pnl = pnl
                    best_score_param = test_score
            
            # --- FASE TESTING OUT-OF-SAMPLE ---
            test_trades = self._simulate_trading_on_df(df_test, min_ai_score=best_score_param)
            oos_trades.extend(test_trades)
            
            start_idx += step
            
        # Hitung metrik akhir dari out-of-sample trades
        metrics = self.calculate_metrics(oos_trades, initial_capital=100000000.0)
        return {
            "ticker": ticker,
            "walk_forward_metrics": metrics,
            "total_trades": len(oos_trades),
            "trades_log": oos_trades
        }

    def _simulate_trading_on_df(self, df_period: pd.DataFrame, min_ai_score: int) -> List[Dict[str, Any]]:
        """Helper untuk mensimulasikan trading pada chunk data frame tertentu."""
        in_position = False
        entry_price = 0.0
        entry_date = None
        atr_at_entry = 0.0
        trades = []
        qty_lot = 10 # Ukuran lot flat untuk optimisasi relative
        
        for idx, row in df_period.iterrows():
            close_val = float(row["close"])
            atr_val = float(row["atr"]) if pd.notna(row["atr"]) else close_val * 0.05
            score_val = row["ai_score"] if pd.notna(row["ai_score"]) else 0
            date_val = row["date"]

            if in_position:
                stop_loss = entry_price - (2 * atr_at_entry)
                if close_val <= stop_loss or score_val < 45:
                    trades.append({
                        "entry_date": entry_date,
                        "entry_price": entry_price,
                        "exit_date": date_val,
                        "exit_price": close_val,
                        "qty": qty_lot,
                        "reason": "Stop Loss" if close_val <= stop_loss else "Score Drop"
                    })
                    in_position = False
            else:
                if score_val >= min_ai_score:
                    entry_price = close_val
                    entry_date = date_val
                    atr_at_entry = atr_val
                    in_position = True
                    
        return trades

    def export_report_to_pdf(self, markdown_content: str, file_path: str) -> bool:
        """Mengekspor laporan pengujian historis ke file PDF."""
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet
            
            doc = SimpleDocTemplate(file_path, pagesize=letter)
            styles = getSampleStyleSheet()
            story = []
            
            # Simple conversion of markdown lines to reportlab flowables
            lines = markdown_content.split('\n')
            for line in lines:
                if line.startswith('# '):
                    story.append(Paragraph(line[2:], styles['Title']))
                    story.append(Spacer(1, 12))
                elif line.startswith('## '):
                    story.append(Paragraph(line[3:], styles['Heading2']))
                    story.append(Spacer(1, 10))
                elif line.startswith('### '):
                    story.append(Paragraph(line[4:], styles['Heading3']))
                    story.append(Spacer(1, 8))
                elif line.strip() == '---':
                    story.append(Spacer(1, 15))
                elif line.strip() != "":
                    story.append(Paragraph(line, styles['Normal']))
                    story.append(Spacer(1, 6))
            
            doc.build(story)
            logger.info(f"Laporan berhasil diekspor ke PDF di {file_path}")
            return True
        except Exception as e:
            logger.error(f"Gagal mengekspor PDF: {str(e)}")
            # Fallback: Simpan file sebagai HTML agar tetap bisa dibuka/di-print sebagai PDF oleh browser
            try:
                html_path = file_path.replace(".pdf", ".html")
                newline = "\n"
                body_content = markdown_content.replace('# ', '<h1>').replace('## ', '<h2>').replace('### ', '<h3>').replace(newline, '<br>')
                html_content = f"<html><body style='font-family: Arial, sans-serif; padding: 40px;'>{body_content}</body></html>"
                with open(html_path, "w", encoding="utf-8") as f:
                    f.write(html_content)
                logger.info(f"Fallback: Laporan disimpan sebagai HTML di {html_path}")
                return False
            except Exception as sub_e:
                logger.error(f"Gagal membuat file HTML fallback: {str(sub_e)}")
                return False
