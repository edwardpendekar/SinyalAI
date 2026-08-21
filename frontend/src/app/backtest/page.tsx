"use client";

import React, { useState } from "react";
import { 
  History,
  Play,
  Settings2,
  TrendingUp,
  Percent,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  FileText
} from "lucide-react";

export default function Backtest() {
  const [ticker, setTicker] = useState("BBCA");
  const [minAiScore, setMinAiScore] = useState(70);
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2026-08-21");
  const [initialCapital, setInitialCapital] = useState("100,000,000");

  const [loading, setLoading] = useState(false);
  const [backtestResult, setBacktestResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showReport, setShowReport] = useState(false);

  const handleRunBacktest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setBacktestResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/backtest/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker: ticker.trim().toUpperCase(),
          start_date: startDate,
          end_date: endDate,
          min_ai_score: Number(minAiScore)
        })
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.status === "success") {
          setBacktestResult(payload);
        } else {
          setErrorMsg(payload.detail || "Gagal memproses pengujian strategi.");
        }
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.detail || "Terjadi kesalahan pada server backtesting.");
      }
    } catch (err) {
      console.error("Error running backtest:", err);
      setErrorMsg("Koneksi gagal ke server backend Sinyal AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-accent-cyan" />
            AI Backtesting Engine
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Uji strategi trading Sinyal AI menggunakan data historis dan simulasi Monte Carlo.
          </p>
        </div>
        
        {backtestResult && (
          <button 
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-cyan hover:bg-accent-cyan/80 text-black text-sm font-bold transition shadow-lg shadow-accent-cyan/25"
          >
            <Download className="w-4 h-4" />
            Print Report
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Config Panel */}
        <form onSubmit={handleRunBacktest} className="lg:col-span-1 glass-card rounded-2xl p-6 h-fit border-t-2 border-t-accent-cyan space-y-4">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-accent-cyan" />
            Parameters
          </h3>
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Ticker / Symbol</label>
            <input 
              type="text" 
              value={ticker} 
              onChange={(e) => setTicker(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors" 
              placeholder="Contoh: BBCA, TLKM"
              required
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Min Entry AI Score</label>
            <input 
              type="number" 
              value={minAiScore} 
              onChange={(e) => setMinAiScore(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors" 
              min={1}
              max={100}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-border text-white text-xs focus:outline-none focus:border-accent-cyan transition-colors" 
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-border text-white text-xs focus:outline-none focus:border-accent-cyan transition-colors" 
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Initial Capital (Rp)</label>
            <input 
              type="text" 
              value={initialCapital} 
              disabled
              className="w-full px-4 py-2.5 rounded-lg bg-black/20 border border-border/50 text-gray-500 text-sm cursor-not-allowed" 
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-purple text-white text-sm font-bold shadow-lg shadow-accent-cyan/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Run Backtest
              </>
            )}
          </button>
        </form>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {errorMsg && (
            <div className="glass-card rounded-2xl p-6 border border-accent-rose/30 bg-accent-rose/5 text-accent-rose flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Gagal Melakukan Backtesting</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {!backtestResult && !loading && !errorMsg && (
            <div className="glass-card rounded-2xl p-16 text-center text-gray-400 border border-border flex flex-col items-center gap-3">
              <History className="w-12 h-12 text-gray-600" />
              <p className="text-sm">Silakan pilih parameter emiten dan jalankan pengujian simulasi historis.</p>
            </div>
          )}

          {loading && (
            <div className="glass-card rounded-2xl p-20 text-center text-gray-400 border border-border flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-accent-cyan animate-spin" />
              <p className="text-sm font-medium">Menjalankan simulasi perdagangan historis &amp; uji Monte Carlo...</p>
            </div>
          )}

          {backtestResult && (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className={`glass-card rounded-2xl p-5 border-b-2 ${
                   backtestResult.data.metrics.total_profit_pct >= 0 ? "border-b-accent-emerald" : "border-b-accent-rose"
                 }`}>
                   <p className="text-xs text-gray-400 mb-1 font-medium">Net Profit</p>
                   <h3 className={`text-2xl font-bold ${
                     backtestResult.data.metrics.total_profit_pct >= 0 ? "text-accent-emerald" : "text-accent-rose"
                   }`}>
                     {backtestResult.data.metrics.total_profit_pct >= 0 ? "+" : ""}{backtestResult.data.metrics.total_profit_pct.toFixed(2)}%
                   </h3>
                   <p className="text-[10px] text-gray-500 mt-1">Rp {Math.round(backtestResult.data.metrics.final_equity - 100000000).toLocaleString('id-ID')}</p>
                 </div>

                 <div className="glass-card rounded-2xl p-5 border-b-2 border-b-accent-purple">
                   <p className="text-xs text-gray-400 mb-1 font-medium">Win Rate</p>
                   <h3 className="text-2xl font-bold text-white">{backtestResult.data.metrics.win_rate.toFixed(1)}%</h3>
                   <p className="text-[10px] text-gray-500 mt-1">From {backtestResult.data.metrics.total_trades} Trades</p>
                 </div>

                 <div className="glass-card rounded-2xl p-5 border-b-2 border-b-accent-rose">
                   <p className="text-xs text-gray-400 mb-1 font-medium">Max Drawdown</p>
                   <h3 className="text-2xl font-bold text-accent-rose">
                     {backtestResult.data.metrics.max_drawdown.toFixed(2)}%
                   </h3>
                   <p className="text-[10px] text-gray-500 mt-1">Risk Profile</p>
                 </div>

                 <div className="glass-card rounded-2xl p-5 border-b-2 border-b-accent-cyan">
                   <p className="text-xs text-gray-400 mb-1 font-medium">Sharpe Ratio</p>
                   <h3 className="text-2xl font-bold text-white">{backtestResult.data.metrics.sharpe_ratio.toFixed(2)}</h3>
                   <p className="text-[10px] text-gray-500 mt-1">Reward/Risk efficiency</p>
                 </div>
              </div>

              {/* Monte Carlo Walk Forward */}
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-black/50 to-accent-emerald/5 border border-accent-emerald/20">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
                  Walk-Forward Analysis (Monte Carlo)
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Berdasarkan simulasi acak 1.000 jalur ekuitas, probabilitas kehancuran modal (*drawdown* melebihi 20%) tercatat sebesar <span className="text-accent-cyan font-bold">{backtestResult.data.monte_carlo.probability_drawdown_20pct.toFixed(2)}%</span>.
                  Estimasi hasil median (P50) tercatat di level index <span className="text-white font-bold">{backtestResult.data.monte_carlo.p50_median.toFixed(1)}</span>, dan rata-rata durasi memegang saham (*holding days*) adalah <span className="text-white font-bold">{backtestResult.data.metrics.avg_holding_days.toFixed(1)} hari</span>.
                </p>
              </div>

              {/* Toggle detailed AI report markdown */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReport(!showReport)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs rounded-xl border border-border flex items-center gap-1.5 transition-all"
                >
                  <FileText className="w-4 h-4 text-accent-purple" />
                  {showReport ? "Hide Detailed AI Report" : "Show Detailed AI Report"}
                </button>
              </div>

              {showReport && (
                <div className="glass-card rounded-2xl p-6 border border-border/80 bg-black/60 prose prose-invert max-w-none text-xs leading-relaxed text-gray-300">
                  <pre className="whitespace-pre-wrap font-sans text-gray-300">
                    {backtestResult.report_markdown}
                  </pre>
                </div>
              )}

              {/* Trade Log */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Trade Execution Log</h3>
                <div className="overflow-x-auto">
                  {backtestResult.data.trades_log.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">Tidak ada transaksi yang dipicu selama periode ini.</p>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                          <th className="py-3 px-4">Date Range</th>
                          <th className="py-3 px-4">Buy Price</th>
                          <th className="py-3 px-4">Sell Price</th>
                          <th className="py-3 px-4 text-right">Shares (Lots)</th>
                          <th className="py-3 px-4 text-right">PnL (Value)</th>
                          <th className="py-3 px-4 text-right">Gain %</th>
                          <th className="py-3 px-4 text-center">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm">
                        {backtestResult.data.trades_log.map((log: any, i: number) => {
                          const pnlPct = ((log.exit_price - log.entry_price) / log.entry_price) * 100;
                          const isProfit = log.pnl >= 0;
                          return (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="py-4 px-4 text-gray-300 whitespace-nowrap text-xs">
                                {log.entry_date} s.d {log.exit_date}
                              </td>
                              <td className="py-4 px-4 text-gray-300 text-xs">Rp {log.entry_price.toLocaleString('id-ID')}</td>
                              <td className="py-4 px-4 text-gray-300 text-xs">Rp {log.exit_price.toLocaleString('id-ID')}</td>
                              <td className="py-4 px-4 text-right text-gray-400 text-xs">{(log.qty * 100).toLocaleString()} ({log.qty})</td>
                              <td className={`py-4 px-4 text-right font-bold text-xs ${isProfit ? "text-accent-emerald" : "text-accent-rose"}`}>
                                {isProfit ? "+" : ""}Rp {Math.round(log.pnl).toLocaleString('id-ID')}
                              </td>
                              <td className={`py-4 px-4 text-right font-bold text-xs ${isProfit ? "text-accent-emerald" : "text-accent-rose"}`}>
                                {isProfit ? "+" : ""}{pnlPct.toFixed(2)}%
                              </td>
                              <td className="py-4 px-4 text-center text-xs">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.exit_price > log.entry_price 
                                    ? "bg-accent-emerald/10 text-accent-emerald" 
                                    : "bg-accent-rose/10 text-accent-rose"
                                }`}>
                                  {log.reason}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
