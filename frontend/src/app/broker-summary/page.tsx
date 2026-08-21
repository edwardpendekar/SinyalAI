"use client";

import React, { useState, useEffect } from "react";
import { 
  Users,
  Search,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Building,
  Loader2
} from "lucide-react";

export default function BrokerSummary() {
  const [ticker, setTicker] = useState("BBCA");
  const [inputTicker, setInputTicker] = useState("BBCA");
  const [brokerData, setBrokerData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrokerData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/scanner/broker-summary/${ticker}`);
        if (res.ok) {
          const data = await res.json();
          setBrokerData(data);
        } else {
          console.error("Gagal mengambil data broker summary:", res.statusText);
        }
      } catch (err) {
        console.error("Error fetching broker summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrokerData();
  }, [ticker]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTicker.trim()) {
      setTicker(inputTicker.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-accent-purple" />
            Broker Summary (Bandarmology)
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Analisis jejak transaksi broker untuk mengetahui aktivitas Bandar (Market Maker) atau ritel.
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
          <span>Memuat data broker summary...</span>
        </div>
      ) : !brokerData ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-400 border border-border">
          Emiten tidak ditemukan atau data database masih kosong.
        </div>
      ) : (
        <>
          {/* AI Bandar Conclusion */}
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-black/60 to-accent-purple/10 border-l-4 border-accent-purple flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Kesimpulan Bandar (AI) untuk {brokerData.ticker}</h3>
               <p className="text-gray-300 text-sm leading-relaxed">
                 Status hari ini: <span className={`font-bold ${
                   brokerData.status.includes("ACCUMULATION") ? "text-accent-emerald" : "text-accent-rose"
                 }`}>{brokerData.status}</span>. <br/>
                 {brokerData.explanation}
               </p>
            </div>
            <div className={`p-4 rounded-xl text-center min-w-[140px] border ${
              brokerData.status.includes("ACCUMULATION") 
                ? "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald" 
                : "bg-accent-rose/10 border-accent-rose/30 text-accent-rose animate-pulse"
            }`}>
               <ShieldCheck className="w-8 h-8 mx-auto mb-1" />
               <p className="text-[10px] font-bold uppercase tracking-wider">
                 {brokerData.safety_score}
               </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Buyers */}
            <div className="glass-card rounded-2xl p-6 border-t-2 border-t-accent-emerald">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-emerald" />
                Top 3 Buyers (Net)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                      <th className="py-3 px-2">Broker</th>
                      <th className="py-3 px-2 text-right">Net Vol (Lots)</th>
                      <th className="py-3 px-2 text-right">Avg Price (Rp)</th>
                      <th className="py-3 px-2 text-right">Net Val (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {brokerData.top_buyers.map((broker: any, i: number) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2">
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-accent-cyan w-8 text-center bg-accent-cyan/10 rounded px-1.5 py-0.5 text-xs">{broker.code}</span>
                             <span className="text-xs text-gray-400 hidden sm:inline">{broker.name}</span>
                           </div>
                        </td>
                        <td className="py-3 px-2 text-right text-accent-emerald font-medium">{broker.volume}</td>
                        <td className="py-3 px-2 text-right text-gray-300">Rp {broker.avgPrice}</td>
                        <td className="py-3 px-2 text-right text-white font-bold">{broker.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Sellers */}
            <div className="glass-card rounded-2xl p-6 border-t-2 border-t-accent-rose">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-accent-rose" />
                Top 3 Sellers (Net)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                      <th className="py-3 px-2">Broker</th>
                      <th className="py-3 px-2 text-right">Net Vol (Lots)</th>
                      <th className="py-3 px-2 text-right">Avg Price (Rp)</th>
                      <th className="py-3 px-2 text-right">Net Val (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {brokerData.top_sellers.map((broker: any, i: number) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2">
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-accent-rose w-8 text-center bg-accent-rose/10 rounded px-1.5 py-0.5 text-xs">{broker.code}</span>
                             <span className="text-xs text-gray-400 hidden sm:inline">{broker.name}</span>
                           </div>
                        </td>
                        <td className="py-3 px-2 text-right text-accent-rose font-medium">{broker.volume}</td>
                        <td className="py-3 px-2 text-right text-gray-300">Rp {broker.avgPrice}</td>
                        <td className="py-3 px-2 text-right text-white font-bold">{broker.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
