"use client";

import React, { useState, useEffect } from "react";
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Clock,
  ArrowRight,
  Loader2,
  X
} from "lucide-react";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicker, setNewTicker] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load watchlist from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sinyalai_watchlist");
    if (saved) {
      setWatchlist(JSON.parse(saved));
    } else {
      const defaultWatchlist = ["DMAS", "DMMX", "BBKP", "ADRO", "BBCA"];
      setWatchlist(defaultWatchlist);
      localStorage.setItem("sinyalai_watchlist", JSON.stringify(defaultWatchlist));
    }
  }, []);

  // Fetch scanner data from backend
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/scanner");
        if (res.ok) {
          const data = await res.json();
          setMarketData(data);
        }
      } catch (err) {
        console.error("Gagal memuat data pasar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  // Sync watchlist change to LocalStorage
  const saveWatchlist = (updatedList: string[]) => {
    setWatchlist(updatedList);
    localStorage.setItem("sinyalai_watchlist", JSON.stringify(updatedList));
  };

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTicker = newTicker.trim().toUpperCase();
    if (!cleanTicker) return;

    // Cek apakah ticker ada di database/data pasar
    const existsInMarket = marketData.some(s => s.ticker === cleanTicker);
    if (!existsInMarket) {
      setErrorMsg(`Emiten ${cleanTicker} tidak ditemukan di database. Pastikan ticker benar.`);
      return;
    }

    if (watchlist.includes(cleanTicker)) {
      setErrorMsg(`Emiten ${cleanTicker} sudah ada di Watchlist Anda.`);
      return;
    }

    const updated = [...watchlist, cleanTicker];
    saveWatchlist(updated);
    setNewTicker("");
    setShowAddModal(false);
    setErrorMsg("");
  };

  const handleRemoveTicker = (tickerToRemove: string) => {
    const updated = watchlist.filter(t => t !== tickerToRemove);
    saveWatchlist(updated);
  };

  // Saring data pasar untuk emiten yang ada di watchlist
  const watchlistStocks = watchlist.map(ticker => {
    const stockInfo = marketData.find(s => s.ticker === ticker);
    if (stockInfo) {
      // Simulasikan persentase change harian
      const h = hash(ticker);
      const simulatedChange = parseFloat(((h % 7) - 3.2).toFixed(2));
      return {
        ...stockInfo,
        change: simulatedChange,
        alerts: h % 3,
        lastUpdated: `${(h % 15) + 1} mins ago`
      };
    }
    // Fallback jika data belum termuat
    return {
      ticker,
      name: "Loading...",
      close: 0,
      change: 0.0,
      ai_score: 50,
      recommendation: "Hold",
      alerts: 0,
      lastUpdated: "Just now"
    };
  });

  // Insights dinamis berbasis data watchlist
  const activeInsights = watchlistStocks
    .filter(s => s.close > 0)
    .map(stock => {
      const isHigh = stock.ai_score >= 75;
      const isLow = stock.ai_score < 45;
      if (isHigh) {
        return {
          type: "success",
          title: `${stock.ticker} Bullish Momentum`,
          message: `AI mendeteksi skor sangat tinggi (${stock.ai_score}) dengan rekomendasi ${stock.recommendation}. Akumulasi asing terdeteksi kuat.`
        };
      } else if (isLow) {
        return {
          type: "danger",
          title: `${stock.ticker} Weakening Signals`,
          message: `Skor AI turun ke level ${stock.ai_score} (${stock.recommendation}). Pertimbangkan untuk memperketat stop loss.`
        };
      }
      return null;
    })
    .filter(Boolean);

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
        
        <button 
          onClick={() => { setShowAddModal(true); setErrorMsg(""); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-purple hover:bg-accent-purple/80 text-white text-sm font-semibold transition shadow-lg shadow-accent-purple/25"
        >
          <Plus className="w-4 h-4" />
          Add Ticker
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
          <span>Memuat watchlist...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Watchlist Cards (Span 2) */}
          <div className="xl:col-span-2 space-y-4">
            {watchlistStocks.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center text-gray-400 border border-border">
                Watchlist Anda kosong. Silakan tambah emiten baru.
              </div>
            ) : (
              watchlistStocks.map((stock, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent-cyan/30 transition-all relative">
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
                      <p className="text-lg font-bold text-white">Rp {stock.close.toLocaleString('id-ID')}</p>
                      <p className={"text-xs font-semibold " + (stock.change > 0 ? "text-accent-emerald" : stock.change < 0 ? "text-accent-rose" : "text-gray-400")}>
                        {stock.change > 0 ? "+" : ""}{stock.change}%
                      </p>
                    </div>

                    <div className="text-left sm:text-right min-w-[100px]">
                      <p className="text-[10px] text-gray-400 mb-1">AI Score</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-800 rounded-full h-1.5">
                          <div className={"h-1.5 rounded-full " + (stock.ai_score >= 80 ? "bg-accent-emerald" : stock.ai_score >= 60 ? "bg-accent-amber" : "bg-accent-rose")} style={{ width: stock.ai_score + '%' }}></div>
                        </div>
                        <span className="text-xs font-bold text-white">{stock.ai_score}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRemoveTicker(stock.ticker)}
                      className="p-2 text-gray-500 hover:text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors"
                      title="Hapus dari Watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Insights */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-accent-amber" />
                Watchlist Insights
              </h3>
              <div className="space-y-4">
                {activeInsights.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">Semua saham di Watchlist Anda berada di fase konsolidasi normal.</p>
                ) : (
                  activeInsights.map((insight: any, i: number) => (
                    <div key={i} className={`p-4 rounded-xl border ${
                      insight.type === 'success' 
                        ? 'bg-accent-emerald/5 border-accent-emerald/10' 
                        : 'bg-accent-rose/5 border-accent-rose/10'
                    }`}>
                      <p className={`text-sm font-semibold mb-1 ${insight.type === 'success' ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                        {insight.title}
                      </p>
                      <p className="text-gray-400 text-xs leading-relaxed">{insight.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-black/40 to-accent-purple/10">
              <h3 className="text-white font-bold mb-2">Automate Your Trading</h3>
              <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                Buat notifikasi otomatis ke WhatsApp / Telegram jika AI Score emiten di Watchlist Anda mencapai angka tertentu.
              </p>
              <a href="/alerts" className="w-full py-2.5 rounded-lg border border-accent-purple text-accent-purple text-xs font-bold hover:bg-accent-purple hover:text-white transition-colors block text-center">
                Set Up AI Alerts
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add Ticker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 relative border border-border">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-white mb-2">Tambah Saham Baru</h3>
            <p className="text-xs text-gray-400 mb-6">
              Masukkan kode saham 4 digit yang terdaftar di Bursa Efek Indonesia.
            </p>

            <form onSubmit={handleAddTicker} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Ticker Saham</label>
                <input 
                  type="text" 
                  placeholder="Contoh: BBRI, ADRO, GOTO" 
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                  maxLength={4}
                  autoFocus
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-accent-rose font-medium bg-accent-rose/10 border border-accent-rose/20 p-2.5 rounded-xl">
                  {errorMsg}
                </p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-gray-400 hover:text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-accent-cyan hover:bg-accent-cyan/80 text-black text-xs font-bold transition shadow-lg shadow-accent-cyan/25"
                >
                  Tambahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple hash generator for deterministic mock values
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h);
}
