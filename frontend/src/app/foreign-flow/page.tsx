"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe,
  Search,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CalendarDays,
  Loader2
} from "lucide-react";

export default function ForeignFlow() {
  const [ticker, setTicker] = useState("BBCA");
  const [inputTicker, setInputTicker] = useState("BBCA");
  const [flowData, setFlowData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlowData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/scanner/foreign-flow/${ticker}`);
        if (res.ok) {
          const data = await res.json();
          setFlowData(data);
        } else {
          console.error("Gagal mengambil data foreign flow:", res.statusText);
        }
      } catch (err) {
        console.error("Error fetching foreign flow:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlowData();
  }, [ticker]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTicker.trim()) {
      setTicker(inputTicker.trim().toUpperCase());
    }
  };

  // Kalkulasi statistik 1 minggu (total net value dari 7 transaksi terakhir)
  const getWeeklyStats = () => {
    if (!flowData || flowData.history.length === 0) return { sum: 0, text: "Hold / Netral", isAcc: false };
    const slice = flowData.history.slice(0, 7);
    let totalNet = 0;
    for (const h of slice) {
      totalNet += h.net_foreign_raw;
    }
    const isAcc = totalNet > 0;
    return {
      sum: totalNet,
      formatted: `${totalNet >= 0 ? '+' : ''}Rp ${(totalNet / 1e6).toFixed(1)} M`,
      text: totalNet > 5000000000 
        ? "Massive Accumulation Phase" 
        : totalNet > 500000000 
        ? "Accumulation Phase" 
        : totalNet < -5000000000 
        ? "Massive Distribution Phase" 
        : totalNet < -500000000 
        ? "Distribution Phase" 
        : "Neutral Flow Phase",
      isAcc
    };
  };

  const weeklyStats = getWeeklyStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#3b82f6]" />
            Foreign Flow Analysis
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Lacak pergerakan dana asing (Foreign Buy/Sell) untuk mendeteksi tren akumulasi institusi.
          </p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
          <Search className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
          <input 
            type="text" 
            placeholder="Cari Ticker (ex: BBCA)..." 
            value={inputTicker}
            onChange={(e) => setInputTicker(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan/50 transition-colors"
          />
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
          <span>Memuat data foreign flow...</span>
        </div>
      ) : !flowData ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-400 border border-border">
          Emiten tidak ditemukan atau data database masih kosong.
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <p className="text-gray-400 text-sm font-medium mb-1">Net Foreign (1 Week)</p>
              <h3 className={`text-3xl font-bold flex items-center gap-2 ${weeklyStats.isAcc ? "text-accent-emerald" : "text-accent-rose"}`}>
                {weeklyStats.formatted}
              </h3>
              <p className="text-gray-500 text-xs mt-2 flex items-center gap-1 font-medium">
                {weeklyStats.isAcc ? (
                  <TrendingUp className="w-3 h-3 text-accent-emerald" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-accent-rose" />
                )} 
                {weeklyStats.text}
              </p>
            </div>
            
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <p className="text-gray-400 text-sm font-medium mb-1">Foreign Ownership</p>
              <h3 className="text-3xl font-bold text-white flex items-center gap-2">
                {(50 + (hash(flowData.ticker) % 35)).toFixed(1)}%
              </h3>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-3">
                 <div className="bg-[#3b82f6] h-1.5 rounded-full" style={{ width: `${(50 + (hash(flowData.ticker) % 35))}%` }}></div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-black/40 to-[#3b82f6]/10 border border-[#3b82f6]/20">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
                 <ArrowRightLeft className="w-4 h-4 text-[#3b82f6]" />
                 AI Flow Interpretation
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                {weeklyStats.isAcc ? (
                  <>Terjadi akumulasi konsisten oleh Asing pada saham <span className="text-white font-bold">{flowData.ticker}</span>. Koreksi harga kecil merupakan kesempatan buyback karena dana asing terus mengalir masuk.</>
                ) : (
                  <>Aliran dana asing cenderung keluar (distribusi) untuk saham <span className="text-white font-bold">{flowData.ticker}</span>. Disarankan waspada jika harga menembus support terdekat.</>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table List */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Daily Foreign Transaction</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Net Vol (Lots)</th>
                      <th className="py-3 px-4 text-right">Net Value</th>
                      <th className="py-3 px-4 text-center">Action</th>
                      <th className="py-3 px-4 text-right">Price Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {flowData.history.map((item: any, i: number) => {
                      const isAcc = item.action === 'Accumulation';
                      return (
                        <tr key={i} className="hover:bg-white/5 transition-colors duration-150">
                          <td className="py-4 px-4 text-gray-300 whitespace-nowrap flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-gray-500" />
                            {item.date}
                          </td>
                          <td className={"py-4 px-4 text-right font-bold " + (isAcc ? "text-accent-emerald" : item.net_foreign_raw < 0 ? "text-accent-rose" : "text-gray-400")}>
                            {item.netVolume}
                          </td>
                          <td className={"py-4 px-4 text-right font-bold " + (isAcc ? "text-accent-emerald" : item.net_foreign_raw < 0 ? "text-accent-rose" : "text-gray-400")}>
                            {item.netValue}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase " + (
                              isAcc 
                                ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20" 
                                : item.net_foreign_raw < 0 
                                ? "bg-accent-rose/10 text-accent-rose border border-accent-rose/20" 
                                : "bg-gray-800 text-gray-400 border border-border"
                            )}>
                              {item.action}
                            </span>
                          </td>
                          <td className={`py-4 px-4 text-right font-medium ${
                            item.priceChange.startsWith('+') ? "text-accent-emerald" : item.priceChange.startsWith('-') ? "text-accent-rose" : "text-gray-400"
                          }`}>
                            {item.priceChange}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Chart Sidebar */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#3b82f6]" />
                Flow Trend (5 Days)
              </h3>
              <div className="flex items-end justify-between h-48 px-2 border-b border-border pb-2">
                {flowData.history.slice(0, 5).reverse().map((data: any, i: number) => {
                   const isAcc = data.action === 'Accumulation';
                   const val = Math.abs(data.net_foreign_raw);
                   const maxVal = Math.max(...flowData.history.map((d: any) => Math.abs(d.net_foreign_raw))) || 1.0;
                   const heightPercent = Math.max((val / maxVal) * 100, 5); // min 5% height

                   return (
                     <div key={i} className="flex flex-col items-center gap-3 w-8 relative group">
                       <div 
                         className={"w-full rounded-t-sm transition-all " + (isAcc ? "bg-accent-emerald" : "bg-accent-rose")} 
                         style={{ height: heightPercent + '%' }}
                       >
                         <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-1.5 rounded whitespace-nowrap z-10 transition-opacity">
                           {data.netValue}
                         </div>
                       </div>
                       <span className="text-[9px] text-gray-500 mt-2 block rotate-45 translate-y-2 whitespace-nowrap">
                         {data.date.substring(0, 6)}
                       </span>
                     </div>
                   );
                })}
              </div>
              <div className="flex justify-between mt-6 text-xs text-gray-500">
                 <span>Older</span>
                 <span>Recent</span>
              </div>
            </div>
          </div>
        </>
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
