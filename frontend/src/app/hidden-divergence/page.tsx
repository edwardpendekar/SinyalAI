"use client";

import React, { useState, useEffect } from "react";
import { 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertCircle,
  Eye,
  Filter,
  Loader2
} from "lucide-react";

export default function HiddenDivergence() {
  const [divergences, setDivergences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"All" | "Bullish" | "Bearish">("All");

  useEffect(() => {
    const fetchDivergences = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/scanner/divergences");
        if (res.ok) {
          const data = await res.json();
          setDivergences(data);
        }
      } catch (err) {
        console.error("Gagal mengambil data divergensi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDivergences();
  }, []);

  // Filter list data berdasarkan pilihan tombol
  const filteredDivergences = divergences.filter((d: any) => {
    if (filterType === "Bullish") return d.type.includes("Bullish");
    if (filterType === "Bearish") return d.type.includes("Bearish");
    return true;
  });

  // Hitung stats dinamis dari data asli
  const bullishCount = divergences.filter((d: any) => d.type.includes("Bullish")).length;
  const bearishCount = divergences.filter((d: any) => d.type.includes("Bearish")).length;
  const avgConf = divergences.length > 0
    ? Math.round(divergences.reduce((sum: number, d: any) => sum + d.confidence_score, 0) / divergences.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-accent-rose" />
            Divergence Radar
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Pantauan sinyal Regular dan Hidden Divergence (Bullish/Bearish) dari berbagai indikator momentum secara real-time.
          </p>
        </div>
        
        {/* Filter Badges */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setFilterType(filterType === "Bullish" ? "All" : "Bullish")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
              filterType === "Bullish" 
                ? "bg-accent-emerald/20 border-accent-emerald text-accent-emerald shadow-lg shadow-accent-emerald/10" 
                : "bg-accent-emerald/5 border-accent-emerald/10 text-accent-emerald/70 hover:bg-accent-emerald/10"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Bullish Only
          </button>
          
          <button 
            onClick={() => setFilterType(filterType === "Bearish" ? "All" : "Bearish")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
              filterType === "Bearish" 
                ? "bg-accent-rose/20 border-accent-rose text-accent-rose shadow-lg shadow-accent-rose/10" 
                : "bg-accent-rose/5 border-accent-rose/10 text-accent-rose/70 hover:bg-accent-rose/10"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Bearish Only
          </button>

          {filterType !== "All" && (
            <button 
              onClick={() => setFilterType("All")}
              className="flex items-center justify-center p-2.5 rounded-xl bg-black/45 border border-border text-gray-300 hover:text-white transition"
              title="Reset Filter"
            >
              <Filter className="w-4 h-4 text-accent-purple" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
          <span>Memindai radar divergensi...</span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-16 h-16 text-accent-emerald" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Active Bullish Divergences</p>
              <h3 className="text-3xl font-bold text-white mt-2">{bullishCount}</h3>
              <p className="text-accent-emerald text-xs mt-2 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3" /> Live Signal
              </p>
            </div>
            
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingDown className="w-16 h-16 text-accent-rose" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Active Bearish Divergences</p>
              <h3 className="text-3xl font-bold text-white mt-2">{bearishCount}</h3>
              <p className="text-accent-rose text-xs mt-2 flex items-center gap-1 font-medium">
                <TrendingDown className="w-3 h-3" /> Live Signal
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <LineChart className="w-16 h-16 text-accent-cyan" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Avg Confidence Score</p>
              <h3 className="text-3xl font-bold text-white mt-2">{avgConf}%</h3>
              <p className="text-accent-cyan text-xs mt-2 flex items-center gap-1 font-medium">
                <Activity className="w-3 h-3" /> High probability setups
              </p>
            </div>
          </div>

          {/* Divergence List */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent-purple" />
              Recent Signals {filterType !== "All" && `(${filterType} Only)`}
            </h3>
            
            <div className="overflow-x-auto">
              {filteredDivergences.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  Tidak ada sinyal divergence aktif yang terdeteksi untuk kriteria filter ini.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4">Ticker</th>
                      <th className="py-4 px-4">Type</th>
                      <th className="py-4 px-4">Indicator</th>
                      <th className="py-4 px-4 text-right">Price @ Signal</th>
                      <th className="py-4 px-4 text-center">Confidence</th>
                      <th className="py-4 px-4">Explanation</th>
                      <th className="py-4 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {filteredDivergences.map((div: any, i: number) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors duration-150">
                        <td className="py-4 px-4 text-gray-400 whitespace-nowrap">{div.date}</td>
                        <td className="py-4 px-4 font-bold text-white">{div.ticker}</td>
                        <td className="py-4 px-4">
                          <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium " + (
                            div.type.includes('Bullish') 
                              ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' 
                              : 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20'
                          )}>
                            {div.type.includes('Bullish') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {div.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-accent-cyan font-medium">{div.indicator}</td>
                        <td className="py-4 px-4 text-right text-gray-300">Rp {div.close.toLocaleString('id-ID')}</td>
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/40 border border-border text-white font-bold text-xs shadow-inner">
                            {Math.round(div.confidence_score)}%
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-xs max-w-md truncate" title={div.explanation}>{div.explanation}</td>
                        <td className="py-4 px-4 text-center">
                          <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="View Chart">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
