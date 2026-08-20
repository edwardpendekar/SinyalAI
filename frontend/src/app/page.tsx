import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  ShieldCheck, 
  ArrowUpRight, 
  Compass, 
  Info,
  DollarSign
} from "lucide-react";

export default function Dashboard() {
  // Mock Data
  const topPicks = [
    { ticker: "BBCA", name: "Bank Central Asia Tbk.", score: 88, rec: "Strong Buy", price: "10,250", target: "11,500", return: "+12.2%", risk: "Low", size: "10%" },
    { ticker: "TLKM", name: "Telkom Indonesia Tbk.", score: 82, rec: "Strong Buy", price: "3,850", target: "4,400", return: "+14.3%", risk: "Low", size: "10%" },
    { ticker: "BBRI", name: "Bank Rakyat Indonesia Tbk.", score: 79, rec: "Buy", price: "6,050", target: "6,700", return: "+10.7%", risk: "Low", size: "5%" },
    { ticker: "ADRO", name: "Adaro Energy Indonesia Tbk.", score: 74, rec: "Buy", price: "2,750", target: "3,100", return: "+12.7%", risk: "Medium", size: "5%" },
    { ticker: "ASII", name: "Astra International Tbk.", score: 68, rec: "Buy", price: "5,150", target: "5,600", return: "+8.7%", risk: "Medium", size: "5%" },
  ];

  const sectorRotations = [
    { sector: "Financials", strength: 85, color: "bg-accent-cyan" },
    { sector: "Infrastructure", strength: 72, color: "bg-accent-purple" },
    { sector: "Basic Materials", strength: 64, color: "bg-accent-amber" },
    { sector: "Technology", strength: 48, color: "bg-accent-emerald" },
    { sector: "Consumer Cyclicals", strength: 35, color: "bg-accent-rose" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome banner with radial blur background */}
      <div className="relative rounded-2xl overflow-hidden glass-panel p-8 bg-gradient-glow border border-border">
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Market Scanner Overview
          </h2>
          <p className="text-gray-400 text-sm max-w-xl">
            Sistem pemantauan AI aktif. ±950 emiten bursa BEI telah berhasil dipindai dalam 82 detik. Ditemukan 2 sinyal divergensi tersembunyi baru.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">IHSG Index</span>
            <TrendingUp className="w-5 h-5 text-accent-emerald" />
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-3xl font-bold tracking-tight text-white">7,325.50</h3>
            <p className="text-xs text-accent-emerald flex items-center gap-1">
              <span className="font-semibold">+1.15%</span> (+83.20 today)
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Fear & Greed Index</span>
            <Compass className="w-5 h-5 text-accent-purple" />
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-3xl font-bold tracking-tight text-white">68</h3>
            <p className="text-xs text-accent-purple font-semibold">
              Greed Area
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Net Foreign Accumulation (1D)</span>
            <DollarSign className="w-5 h-5 text-accent-cyan" />
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-3xl font-bold tracking-tight text-white">+845.2 B</h3>
            <p className="text-xs text-accent-cyan font-semibold">
              Foreign inflow active
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Active Divergences Detected</span>
            <Layers className="w-5 h-5 text-accent-amber" />
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-3xl font-bold tracking-tight text-white">12</h3>
            <p className="text-xs text-accent-amber font-semibold">
              9 Bullish / 3 Bearish
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Rotations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mock Chart Area */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-cyan" />
              BBCA Chart (TradingView Lightweight Mock)
            </h3>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 font-medium">1D</span>
              <span className="px-2 py-0.5 rounded bg-accent-cyan/15 text-[10px] text-accent-cyan font-semibold">1W</span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 font-medium">1M</span>
            </div>
          </div>
          {/* Mock Candle Visualization */}
          <div className="h-64 rounded-xl bg-black/40 border border-border/50 flex flex-col justify-end p-6 space-y-4 relative overflow-hidden">
            {/* Glowing gradient background */}
            <div className="absolute inset-0 bg-gradient-to-t from-accent-purple/5 to-transparent pointer-events-none"></div>
            
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-6 opacity-5 pointer-events-none">
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
            </div>

            {/* Simulated Candles */}
            <div className="h-full flex items-end justify-between px-10 relative z-10">
              <div className="w-4 h-24 bg-accent-rose/30 border border-accent-rose rounded-sm flex items-center justify-center relative">
                <div className="absolute w-[2px] h-32 bg-accent-rose -z-10"></div>
              </div>
              <div className="w-4 h-32 bg-accent-emerald/30 border border-accent-emerald rounded-sm flex items-center justify-center relative">
                <div className="absolute w-[2px] h-40 bg-accent-emerald -z-10"></div>
              </div>
              <div className="w-4 h-28 bg-accent-rose/30 border border-accent-rose rounded-sm flex items-center justify-center relative">
                <div className="absolute w-[2px] h-36 bg-accent-rose -z-10"></div>
              </div>
              <div className="w-4 h-48 bg-accent-emerald/30 border border-accent-emerald rounded-sm flex items-center justify-center relative">
                <div className="absolute w-[2px] h-56 bg-accent-emerald -z-10"></div>
                <span className="absolute -top-6 text-[10px] bg-accent-emerald/20 text-accent-emerald px-1.5 py-0.5 rounded border border-accent-emerald/30">
                  Buy
                </span>
              </div>
              <div className="w-4 h-40 bg-accent-emerald/30 border border-accent-emerald rounded-sm flex items-center justify-center relative">
                <div className="absolute w-[2px] h-48 bg-accent-emerald -z-10"></div>
              </div>
            </div>

            {/* Volume Profile Overlay */}
            <div className="absolute left-0 inset-y-0 w-24 flex flex-col justify-between py-6 opacity-20 pointer-events-none">
              <div className="h-4 bg-accent-cyan w-20"></div>
              <div className="h-4 bg-accent-cyan w-12"></div>
              <div className="h-4 bg-accent-cyan w-24"></div>
              <div className="h-4 bg-accent-cyan w-8"></div>
            </div>
          </div>
        </div>

        {/* Sector Rotation Panel */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-purple" />
            Sector Rotation Strength
          </h3>
          <div className="space-y-4">
            {sectorRotations.map((item) => (
              <div key={item.sector} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-300">{item.sector}</span>
                  <span className="text-white">{item.strength}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.strength}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top AI Stock Scanner Picks Table */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent-cyan" />
            AI Stock Scanner: Top Picks (Score &gt;= 60)
          </h3>
          <span className="text-xs text-gray-400">Terakhir diperbarui: Hari ini, 16:30 WIB</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                <th className="py-4 px-4">Ticker</th>
                <th className="py-4 px-4">Name</th>
                <th className="py-4 px-4 text-center">AI Score</th>
                <th className="py-4 px-4 text-center">Recommendation</th>
                <th className="py-4 px-4 text-right">Price</th>
                <th className="py-4 px-4 text-right">Target Price</th>
                <th className="py-4 px-4 text-center">Exp. Return</th>
                <th className="py-4 px-4 text-center">Risk</th>
                <th className="py-4 px-4 text-center">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {topPicks.map((pick) => (
                <tr key={pick.ticker} className="hover:bg-white/5 transition-colors duration-150">
                  <td className="py-4 px-4 font-bold text-accent-cyan flex items-center gap-1.5">
                    {pick.ticker}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                  </td>
                  <td className="py-4 px-4 text-gray-300">{pick.name}</td>
                  <td className="py-4 px-4 text-center font-semibold text-white">
                    <span className="px-2 py-1 rounded-md bg-accent-purple/20 border border-accent-purple/30 text-accent-purple">
                      {pick.score}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30">
                      {pick.rec}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-white">Rp {pick.price}</td>
                  <td className="py-4 px-4 text-right font-medium text-accent-cyan">Rp {pick.target}</td>
                  <td className="py-4 px-4 text-center font-bold text-accent-emerald">{pick.return}</td>
                  <td className="py-4 px-4 text-center text-gray-400">{pick.risk}</td>
                  <td className="py-4 px-4 text-center font-semibold text-white">{pick.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
