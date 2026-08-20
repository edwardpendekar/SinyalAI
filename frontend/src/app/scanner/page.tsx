import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function Scanner() {
  const mockStocks = [
    { ticker: "BBCA", name: "Bank Central Asia Tbk.", sector: "Financials", cap: "1,262 T", roe: "19.5%", per: "24.2", pbv: "4.8", der: "0.22", score: 88, rec: "Strong Buy" },
    { ticker: "TLKM", name: "Telkom Indonesia Tbk.", sector: "Infrastructure", cap: "382 T", roe: "16.8%", per: "14.5", pbv: "2.4", der: "0.78", score: 82, rec: "Strong Buy" },
    { ticker: "BBRI", name: "Bank Rakyat Indonesia Tbk.", sector: "Financials", cap: "912 T", roe: "18.2%", per: "15.2", pbv: "2.8", der: "0.85", score: 79, rec: "Buy" },
    { ticker: "ADRO", name: "Adaro Energy Indonesia Tbk.", sector: "Basic Materials", cap: "88 T", roe: "22.4%", per: "4.8", pbv: "0.95", der: "0.45", score: 74, rec: "Buy" },
    { ticker: "ASII", name: "Astra International Tbk.", sector: "Industrials", cap: "208 T", roe: "14.2%", per: "8.2", pbv: "1.10", der: "0.92", score: 68, rec: "Buy" },
    { ticker: "UNVR", name: "Unilever Indonesia Tbk.", sector: "Consumer Non-Cyclicals", cap: "112 T", roe: "45.0%", per: "28.5", pbv: "18.2", der: "0.82", score: 55, rec: "Hold" },
    { ticker: "GOTO", name: "GoTo Gojek Tokopedia Tbk.", sector: "Technology", cap: "98 T", roe: "-8.5%", per: "-12.5", pbv: "0.80", der: "0.15", score: 38, rec: "Avoid" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-cyan" />
            AI Stock Scanner
          </h2>
          <p className="text-gray-400 text-sm">
            Scan seluruh ±950 saham BEI secara real-time berdasarkan data fundamental &amp; teknikal terbaru.
          </p>
        </div>
        
        {/* Connection status indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          Scanner Active: 954/954 Stocks Synced
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
          <input 
            type="text" 
            placeholder="Search by Ticker or Name... (e.g. BBCA, Telkom)" 
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-purple/50 transition-colors"
          />
        </div>
        
        <div className="relative">
          <select className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-gray-300 text-sm focus:outline-none focus:border-accent-purple/50 appearance-none cursor-pointer">
            <option>All Sectors</option>
            <option>Financials</option>
            <option>Infrastructure</option>
            <option>Basic Materials</option>
            <option>Technology</option>
          </select>
          <SlidersHorizontal className="w-4 h-4 text-gray-500 absolute right-4 top-4 pointer-events-none" />
        </div>

        <div className="relative">
          <select className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-gray-300 text-sm focus:outline-none focus:border-accent-purple/50 appearance-none cursor-pointer">
            <option>Sort By: AI Score (High-Low)</option>
            <option>Sort By: Market Cap (High-Low)</option>
            <option>Sort By: PER (Low-High)</option>
            <option>Sort By: ROE (High-Low)</option>
          </select>
          <ArrowUpDown className="w-4 h-4 text-gray-500 absolute right-4 top-4 pointer-events-none" />
        </div>
      </div>

      {/* Stock Scanner Table Grid */}
      <div className="glass-card rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                <th className="py-4 px-4">Ticker</th>
                <th className="py-4 px-4">Name</th>
                <th className="py-4 px-4">Sector</th>
                <th className="py-4 px-4 text-right">Market Cap</th>
                <th className="py-4 px-4 text-right">ROE</th>
                <th className="py-4 px-4 text-right">PER</th>
                <th className="py-4 px-4 text-right">PBV</th>
                <th className="py-4 px-4 text-right">DER</th>
                <th className="py-4 px-4 text-center">AI Score</th>
                <th className="py-4 px-4 text-center">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {mockStocks.map((stock) => (
                <tr key={stock.ticker} className="hover:bg-white/5 transition-colors duration-150">
                  <td className="py-4 px-4 font-bold text-accent-cyan">{stock.ticker}</td>
                  <td className="py-4 px-4 text-gray-300">{stock.name}</td>
                  <td className="py-4 px-4 text-gray-400 text-xs">{stock.sector}</td>
                  <td className="py-4 px-4 text-right font-medium text-white">{stock.cap}</td>
                  <td className="py-4 px-4 text-right text-gray-300">{stock.roe}</td>
                  <td className="py-4 px-4 text-right text-gray-300">{stock.per}</td>
                  <td className="py-4 px-4 text-right text-gray-300">{stock.pbv}</td>
                  <td className="py-4 px-4 text-right text-gray-300">{stock.der}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-1 rounded bg-accent-purple/20 border border-accent-purple/30 text-accent-purple font-bold">
                      {stock.score}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                      stock.rec === "Strong Buy" 
                        ? "bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30"
                        : stock.rec === "Buy"
                        ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30"
                        : stock.rec === "Hold"
                        ? "bg-accent-amber/20 text-accent-amber border-accent-amber/30"
                        : "bg-accent-rose/20 text-accent-rose border-accent-rose/30"
                    }`}>
                      {stock.rec}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
