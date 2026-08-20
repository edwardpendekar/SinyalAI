import { 
  Briefcase, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  History
} from "lucide-react";

export default function Portfolio() {
  const mockPositions = [
    { ticker: "BBCA", shares: 1500, avgPrice: 9800, currentPrice: 10200, allocation: 35 },
    { ticker: "TLKM", shares: 5000, avgPrice: 3300, currentPrice: 3150, allocation: 25 },
    { ticker: "ADRO", shares: 4500, avgPrice: 2400, currentPrice: 2850, allocation: 20 },
    { ticker: "ASII", shares: 2000, avgPrice: 4800, currentPrice: 5100, allocation: 15 },
    { ticker: "Cash", shares: 0, avgPrice: 0, currentPrice: 1, allocation: 5 },
  ];

  const totalValue = 42800000;
  const totalGain = 2150000;
  const gainPercentage = 5.28;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-accent-emerald" />
            AI Managed Portfolio
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Ringkasan aset, keuntungan/kerugian (PnL), dan rekomendasi re-balancing AI.
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-border text-gray-300 hover:text-white transition">
          <History className="w-4 h-4" />
          Trade History
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Wallet className="w-24 h-24 text-accent-cyan" />
          </div>
          <p className="text-gray-400 text-sm font-medium">Total Equity Value</p>
          <h3 className="text-3xl font-bold text-white mt-2">Rp 42.800.000</h3>
          <p className="text-gray-500 text-xs mt-2 font-medium">
            Available Cash: Rp 2.140.000
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp className="w-24 h-24 text-accent-emerald" />
          </div>
          <p className="text-gray-400 text-sm font-medium">Total Unrealized PnL</p>
          <h3 className="text-3xl font-bold text-accent-emerald mt-2 flex items-center gap-2">
            +Rp 2.150.000
          </h3>
          <p className="text-accent-emerald text-xs mt-2 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" /> +5.28% All Time
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-black/40 to-accent-emerald/10 border border-accent-emerald/20">
          <h3 className="text-white font-bold mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-emerald" />
            AI Re-balance Alert
          </h3>
          <p className="text-gray-400 text-xs mb-3">
            Portfolio Anda overweight pada sektor Financials. Pertimbangkan untuk merealisasikan profit pada BBCA.
          </p>
          <button className="w-full py-2 rounded-lg bg-accent-emerald hover:bg-accent-emerald/80 text-black text-xs font-bold transition-colors">
            Generate Re-balancing Plan
          </button>
        </div>
      </div>

      {/* Two Column Layout for Positions and Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Positions Table (Span 2) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Current Positions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                  <th className="py-4 px-4">Asset</th>
                  <th className="py-4 px-4 text-right">Shares</th>
                  <th className="py-4 px-4 text-right">Avg Price</th>
                  <th className="py-4 px-4 text-right">Last Price</th>
                  <th className="py-4 px-4 text-right">Total Value</th>
                  <th className="py-4 px-4 text-right">Unrealized PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {mockPositions.filter(p => p.ticker !== 'Cash').map((pos, i) => {
                  const marketValue = pos.shares * pos.currentPrice;
                  const costBasis = pos.shares * pos.avgPrice;
                  const pnl = marketValue - costBasis;
                  const pnlPercent = (pnl / costBasis) * 100;
                  const isProfit = pnl >= 0;

                  return (
                    <tr key={i} className="hover:bg-white/5 transition-colors duration-150">
                      <td className="py-4 px-4 font-bold text-white">{pos.ticker}</td>
                      <td className="py-4 px-4 text-right text-gray-300">{pos.shares.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right text-gray-400">{pos.avgPrice.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-medium text-white">{pos.currentPrice.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-medium text-white">{marketValue.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">
                        <div className={"font-bold " + (isProfit ? "text-accent-emerald" : "text-accent-rose")}>
                          {isProfit ? "+" : ""}{pnl.toLocaleString()}
                        </div>
                        <div className={"text-xs " + (isProfit ? "text-accent-emerald/70" : "text-accent-rose/70")}>
                          {isProfit ? "+" : ""}{pnlPercent.toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocation Sidebar */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-accent-purple" />
            Asset Allocation
          </h3>
          
          <div className="space-y-4">
            {mockPositions.map((pos, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-gray-300">{pos.ticker}</span>
                  <span className="text-sm text-gray-400">{pos.allocation}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-accent-purple to-accent-cyan"
                    style={{ width: pos.allocation + '%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
             <h4 className="text-sm font-bold text-white mb-3">AI Diversification Score</h4>
             <div className="flex items-center gap-4">
               <div className="text-3xl font-black text-accent-cyan">A-</div>
               <p className="text-xs text-gray-400">Portofolio Anda sudah cukup ter-diversifikasi, namun masih sedikit terlalu berat pada perbankan.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
