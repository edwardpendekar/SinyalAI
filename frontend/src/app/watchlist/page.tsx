import { 
  Bookmark, 
  Plus, 
  MoreVertical, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";

export default function Watchlist() {
  const mockWatchlist = [
    { ticker: "BBCA", name: "Bank Central Asia Tbk.", price: 10200, change: 1.5, score: 88, rec: "Strong Buy", alerts: 2, lastUpdated: "10 mins ago" },
    { ticker: "TLKM", name: "Telkom Indonesia Tbk.", price: 3150, change: -0.8, score: 82, rec: "Buy", alerts: 0, lastUpdated: "15 mins ago" },
    { ticker: "BBRI", name: "Bank Rakyat Indonesia Tbk.", price: 4800, change: 2.1, score: 79, rec: "Buy", alerts: 1, lastUpdated: "5 mins ago" },
    { ticker: "ADRO", name: "Adaro Energy Indonesia Tbk.", price: 2850, change: 0.0, score: 74, rec: "Hold", alerts: 0, lastUpdated: "20 mins ago" },
    { ticker: "GOTO", name: "GoTo Gojek Tokopedia Tbk.", price: 54, change: -3.5, score: 38, rec: "Avoid", alerts: 3, lastUpdated: "2 mins ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-accent-cyan" />
            My Watchlist
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Pantau emiten favorit Anda secara real-time dengan dukungan analisis AI.
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-purple hover:bg-accent-purple/80 text-white text-sm font-semibold transition shadow-lg shadow-accent-purple/25">
          <Plus className="w-4 h-4" />
          Add Ticker
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Watchlist Cards (Span 2) */}
        <div className="xl:col-span-2 space-y-4">
          {mockWatchlist.map((stock, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent-cyan/30 transition-all">
              <div className="flex items-center gap-4">
                <div className={"flex items-center justify-center w-12 h-12 rounded-xl border " + (stock.change > 0 ? "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald" : stock.change < 0 ? "bg-accent-rose/10 border-accent-rose/20 text-accent-rose" : "bg-gray-800/50 border-gray-700 text-gray-400")}>
                  {stock.change > 0 ? <TrendingUp className="w-6 h-6" /> : stock.change < 0 ? <TrendingDown className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {stock.ticker}
                    {stock.alerts > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-rose text-white text-[10px] font-bold">
                        {stock.alerts}
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm">{stock.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto">
                <div className="text-left sm:text-right">
                  <p className="text-lg font-bold text-white">Rp {stock.price.toLocaleString('id-ID')}</p>
                  <p className={"text-xs font-semibold " + (stock.change > 0 ? "text-accent-emerald" : stock.change < 0 ? "text-accent-rose" : "text-gray-400")}>
                    {stock.change > 0 ? "+" : ""}{stock.change}%
                  </p>
                </div>

                <div className="text-left sm:text-right min-w-[80px]">
                  <p className="text-xs text-gray-400 mb-1">AI Score</p>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-800 rounded-full h-1.5 w-16">
                      <div className={"h-1.5 rounded-full " + (stock.score >= 80 ? "bg-accent-emerald" : stock.score >= 60 ? "bg-accent-amber" : "bg-accent-rose")} style={{ width: stock.score + '%' }}></div>
                    </div>
                    <span className="text-sm font-bold text-white">{stock.score}</span>
                  </div>
                </div>

                <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent-amber" />
              Watchlist Insights
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-accent-emerald/5 border border-accent-emerald/10">
                <p className="text-accent-emerald text-sm font-medium mb-1">BBCA Momentum Breakout</p>
                <p className="text-gray-400 text-xs">AI mendeteksi anomali volume beli asing sebesar +340 Milyar dalam 1 jam terakhir.</p>
                <button className="mt-3 text-accent-cyan text-xs font-semibold flex items-center gap-1 hover:underline">
                  View Detail <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-accent-rose/5 border border-accent-rose/10">
                <p className="text-accent-rose text-sm font-medium mb-1">GOTO Support Breakdown</p>
                <p className="text-gray-400 text-xs">Harga telah menembus support psikologis 55. RSI menunjukkan bearish divergence.</p>
                <button className="mt-3 text-accent-cyan text-xs font-semibold flex items-center gap-1 hover:underline">
                  View Detail <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-black/40 to-accent-purple/10">
            <h3 className="text-white font-bold mb-2">Automate Your Trading</h3>
            <p className="text-gray-400 text-xs mb-4">
              Buat notifikasi otomatis ke WhatsApp / Telegram jika AI Score emiten di Watchlist Anda mencapai angka tertentu.
            </p>
            <button className="w-full py-2.5 rounded-lg border border-accent-purple text-accent-purple text-sm font-semibold hover:bg-accent-purple hover:text-white transition-colors">
              Set Up AI Alerts
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
