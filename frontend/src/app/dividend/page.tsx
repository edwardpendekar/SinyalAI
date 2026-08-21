"use client";

import React, { useState, useEffect } from "react";
import { 
  Coins,
  Search,
  CalendarDays,
  TrendingUp,
  Percent,
  ShieldCheck,
  Building2,
  Loader2
} from "lucide-react";

export default function Dividend() {
  const [ticker, setTicker] = useState("BBCA");
  const [inputTicker, setInputTicker] = useState("BBCA");
  const [dividendData, setDividendData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDividends = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/scanner/dividends/${ticker}`);
        if (res.ok) {
          const data = await res.json();
          setDividendData(data);
        } else {
          console.error("Gagal mengambil data dividen:", res.statusText);
        }
      } catch (err) {
        console.error("Error fetching dividends:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDividends();
  }, [ticker]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTicker.trim()) {
      setTicker(inputTicker.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-accent-amber" />
            Dividend Analysis
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Riwayat pembayaran dividen, proyeksi *yield*, dan analisis keberlanjutan.
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
          <span>Memuat data dividen...</span>
        </div>
      ) : !dividendData ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-400 border border-border">
          Emiten tidak ditemukan atau data database masih kosong.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Stats Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
               <div className="w-16 h-16 rounded-full bg-accent-amber/20 border border-accent-amber/30 flex items-center justify-center mb-4">
                 <Building2 className="w-8 h-8 text-accent-amber" />
               </div>
               <h3 className="text-3xl font-black text-white">{dividendData.ticker}</h3>
               <p className="text-gray-400 font-medium text-xs">{dividendData.name}</p>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent-emerald/20 text-accent-emerald">
                  <Percent className="w-4 h-4" />
                </div>
                <p className="text-sm text-gray-400">Dividend Yield (TTM)</p>
              </div>
              <h4 className="text-2xl font-bold text-white">{dividendData.dividend_yield.toFixed(2)}%</h4>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent-cyan/20 text-accent-cyan">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-sm text-gray-400">5-Yr CAGR Growth</p>
              </div>
              <h4 className="text-2xl font-bold text-white">{dividendData.cagr_5yr.toFixed(1)}%</h4>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent-purple/20 text-accent-purple">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-sm text-gray-400">Payout Ratio</p>
              </div>
              <h4 className="text-2xl font-bold text-white">{dividendData.payout_ratio.toFixed(1)}%</h4>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-3">
                 <div className="bg-accent-purple h-1.5 rounded-full" style={{ width: `${Math.min(100, dividendData.payout_ratio)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* AI Sustainability Analysis */}
            <div className="glass-card rounded-2xl p-6 border border-accent-emerald/30 bg-gradient-to-br from-black/40 to-accent-emerald/5">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent-emerald" />
                AI Dividend Safety Score: {dividendData.safety_score}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {dividendData.sustainability_report}
              </p>
            </div>

            {/* Dividend Growth Chart */}
            {dividendData.dividend_yield > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Dividend Growth History (Rp/Share)</h3>
                <div className="flex items-end justify-between h-48 px-2 md:px-8">
                  {dividendData.chart_data.map((data: any, i: number) => {
                    const maxTotal = Math.max(...dividendData.chart_data.map((d: any) => d.total)) || 1.0;
                    const heightPercent = (data.total / maxTotal) * 100;
                    return (
                      <div key={i} className="flex flex-col items-center gap-3 w-12 md:w-16">
                        <div className="w-full bg-accent-amber/80 hover:bg-accent-amber rounded-t-md transition-all relative group flex flex-col justify-end" style={{ height: heightPercent + '%' }}>
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-white font-bold text-xs">
                            {Math.round(data.total)}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{data.year}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dividend History Table */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Historical Payments</h3>
              <div className="overflow-x-auto">
                {dividendData.history.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    Tidak ada riwayat pembayaran dividen untuk emiten ini.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                        <th className="py-3 px-4">Year</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Amount (Rp)</th>
                        <th className="py-3 px-4">Ex-Date</th>
                        <th className="py-3 px-4">Payment Date</th>
                        <th className="py-3 px-4 text-right">Est. Yield</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {dividendData.history.map((log: any, i: number) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors duration-150">
                          <td className="py-4 px-4 text-gray-300 whitespace-nowrap">{log.year}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              log.type === "Final" ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-cyan/10 text-accent-cyan"
                            }`}>
                              {log.type}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-gray-300 font-semibold">Rp {log.amount.toLocaleString('id-ID')}</td>
                          <td className="py-4 px-4 text-gray-400 text-xs">{log.exDate}</td>
                          <td className="py-4 px-4 text-gray-400 text-xs">{log.paymentDate}</td>
                          <td className="py-4 px-4 text-right text-accent-amber font-medium">{log.yield}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
