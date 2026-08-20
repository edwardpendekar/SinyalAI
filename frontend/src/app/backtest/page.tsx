import { 
  History,
  Play,
  Settings2,
  TrendingUp,
  Percent,
  Download,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

export default function Backtest() {
  const tradeLog = [
    { date: "15 Aug 2026", type: "Buy", price: "9,800", shares: 1000, value: "9,800,000", result: "-" },
    { date: "18 Aug 2026", type: "Sell", price: "10,200", shares: 1000, value: "10,200,000", result: "+4.08%" },
    { date: "02 Jul 2026", type: "Buy", price: "9,500", shares: 1000, value: "9,500,000", result: "-" },
    { date: "10 Jul 2026", type: "Sell", price: "9,750", shares: 1000, value: "9,750,000", result: "+2.63%" },
    { date: "12 Jun 2026", type: "Buy", price: "10,100", shares: 1000, value: "10,100,000", result: "-" },
    { date: "16 Jun 2026", type: "Sell", price: "9,950", shares: 1000, value: "9,950,000", result: "-1.48%" },
  ];

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
        
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-cyan hover:bg-accent-cyan/80 text-black text-sm font-bold transition shadow-lg shadow-accent-cyan/25">
          <Download className="w-4 h-4" />
          Export PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Config Panel */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 h-fit border-t-2 border-t-accent-cyan">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-accent-cyan" />
            Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Ticker / Symbol</label>
              <input type="text" defaultValue="BBCA" className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors" />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Strategy Algorithm</label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors appearance-none cursor-pointer">
                <option>AI Composite Score {'>'} 75</option>
                <option>MACD + Hidden Divergence</option>
                <option>Foreign Accumulation Breakout</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Start Date</label>
                <input type="date" defaultValue="2025-01-01" className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-border text-white text-xs focus:outline-none focus:border-accent-cyan transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">End Date</label>
                <input type="date" defaultValue="2026-08-20" className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-border text-white text-xs focus:outline-none focus:border-accent-cyan transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Initial Capital (Rp)</label>
              <input type="text" defaultValue="100,000,000" className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors" />
            </div>
            
            <button className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-purple text-white text-sm font-bold shadow-lg shadow-accent-cyan/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
              <Play className="w-4 h-4 fill-white" />
              Run Backtest
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="glass-card rounded-2xl p-5 border-b-2 border-b-accent-emerald">
               <p className="text-xs text-gray-400 mb-1 font-medium">Net Profit</p>
               <h3 className="text-2xl font-bold text-accent-emerald">+24.5%</h3>
               <p className="text-[10px] text-gray-500 mt-1">Rp 24,500,000</p>
             </div>
             <div className="glass-card rounded-2xl p-5 border-b-2 border-b-accent-purple">
               <p className="text-xs text-gray-400 mb-1 font-medium">Win Rate</p>
               <h3 className="text-2xl font-bold text-white">68.4%</h3>
               <p className="text-[10px] text-gray-500 mt-1">From 42 Trades</p>
             </div>
             <div className="glass-card rounded-2xl p-5 border-b-2 border-b-accent-rose">
               <p className="text-xs text-gray-400 mb-1 font-medium">Max Drawdown</p>
               <h3 className="text-2xl font-bold text-accent-rose">-8.2%</h3>
               <p className="text-[10px] text-gray-500 mt-1">Acceptable Risk</p>
             </div>
             <div className="glass-card rounded-2xl p-5 border-b-2 border-b-accent-cyan">
               <p className="text-xs text-gray-400 mb-1 font-medium">Sharpe Ratio</p>
               <h3 className="text-2xl font-bold text-white">1.85</h3>
               <p className="text-[10px] text-gray-500 mt-1">Excellent Return/Risk</p>
             </div>
          </div>

          <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-black/50 to-accent-emerald/5 border border-accent-emerald/20">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
              Walk-Forward Analysis (Monte Carlo)
            </h3>
            <p className="text-sm text-gray-300">
              Sistem berhasil lulus 10,000 iterasi Monte Carlo. Strategi ini terbukti robust dan tidak overfitting (hanya mengandalkan probabilitas historis). Peluang kebangkrutan (Risk of Ruin) tercatat &lt; 0.01% dengan Average Holding Days 14 hari.
            </p>
          </div>

          {/* Trade Log */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Trade Execution Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Shares</th>
                    <th className="py-3 px-4 text-right">Value (Rp)</th>
                    <th className="py-3 px-4 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {tradeLog.map((log, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-gray-300 whitespace-nowrap">{log.date}</td>
                      <td className="py-4 px-4 font-bold">
                         <span className={"px-2 py-1 rounded text-xs " + (log.type === 'Buy' ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-rose/10 text-accent-rose")}>
                           {log.type}
                         </span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-300">{log.price}</td>
                      <td className="py-4 px-4 text-right text-gray-400">{log.shares}</td>
                      <td className="py-4 px-4 text-right text-gray-300">{log.value}</td>
                      <td className={"py-4 px-4 text-right font-bold " + (log.result.includes('+') ? "text-accent-emerald" : log.result.includes('-') && log.result.length > 1 ? "text-accent-rose" : "text-gray-500")}>
                        {log.result}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
