"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles,
  CheckCircle2,
  Loader2
} from "lucide-react";

export default function Scanner() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [sortBy, setSortBy] = useState("AI Score (High-Low)");

  useEffect(() => {
    const fetchScannerData = async () => {
      try {
        setLoading(true);
        // Memanggil API relative proxy Nginx
        const res = await fetch("/api/v1/scanner");
        if (res.ok) {
          const data = await res.json();
          setStocks(data);
        } else {
          console.error("Gagal mengambil data scanner:", res.statusText);
        }
      } catch (err) {
        console.error("Error fetching scanner data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScannerData();
  }, []);

  // Kumpulkan semua sektor unik dari data saham secara dinamis
  const sectors = ["All Sectors", ...Array.from(new Set(stocks.map(s => s.sector).filter(Boolean)))];

  // Pemrosesan Data: Filter & Sort Client-Side
  const filteredAndSortedStocks = stocks
    .filter((stock) => {
      // 1. Filter Pencarian Ticker / Nama
      const matchQuery = 
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Filter Sektor
      const matchSector = 
        selectedSector === "All Sectors" || 
        stock.sector === selectedSector;
        
      return matchQuery && matchSector;
    })
    .sort((a, b) => {
      // 3. Sorting Logika
      if (sortBy === "AI Score (High-Low)") {
        return (b.ai_score || 0) - (a.ai_score || 0);
      } else if (sortBy === "Market Cap (High-Low)") {
        return (b.market_cap || 0) - (a.market_cap || 0);
      } else if (sortBy === "PER (Low-High)") {
        // PER rendah-tinggi (saham rugi/negatif diletakkan di paling bawah)
        const perA = a.per === null || a.per === undefined ? 999999 : a.per;
        const perB = b.per === null || b.per === undefined ? 999999 : b.per;
        
        if (perA < 0 && perB >= 0) return 1;
        if (perB < 0 && perA >= 0) return -1;
        return perA - perB;
      } else if (sortBy === "ROE (High-Low)") {
        return (b.roe || 0) - (a.roe || 0);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-cyan" />
            AI Stock Scanner
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Scan seluruh emiten BEI secara real-time berdasarkan data fundamental &amp; teknikal terbaru.
          </p>
        </div>
        
        {/* Connection status indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs font-semibold self-start md:self-auto">
          <CheckCircle2 className="w-4 h-4" />
          Scanner Active: {stocks.length} Stocks Synced
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
          <input 
            type="text" 
            placeholder="Search by Ticker or Name... (e.g. BBCA, Telkom)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan/50 transition-colors"
          />
        </div>
        
        <div className="relative">
          <select 
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-gray-300 text-sm focus:outline-none focus:border-accent-cyan/50 appearance-none cursor-pointer"
          >
            {sectors.map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
          <SlidersHorizontal className="w-4 h-4 text-gray-500 absolute right-4 top-4 pointer-events-none" />
        </div>

        <div className="relative">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-gray-300 text-sm focus:outline-none focus:border-accent-cyan/50 appearance-none cursor-pointer"
          >
            <option value="AI Score (High-Low)">Sort By: AI Score (High-Low)</option>
            <option value="Market Cap (High-Low)">Sort By: Market Cap (High-Low)</option>
            <option value="PER (Low-High)">Sort By: PER (Low-High)</option>
            <option value="ROE (High-Low)">Sort By: ROE (High-Low)</option>
          </select>
          <ArrowUpDown className="w-4 h-4 text-gray-500 absolute right-4 top-4 pointer-events-none" />
        </div>
      </div>

      {/* Stock Scanner Table Grid */}
      <div className="glass-card rounded-2xl p-6">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
              <span>Memuat data scanner...</span>
            </div>
          ) : filteredAndSortedStocks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {stocks.length === 0 
                ? "Tidak ada data saham yang ditemukan. Pastikan Anda sudah menjalankan sinkronisasi data di halaman Admin."
                : "Tidak ada emiten yang cocok dengan filter pencarian Anda."}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                  <th className="py-4 px-4">Ticker</th>
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4">Sector</th>
                  <th className="py-4 px-4 text-right">Price</th>
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
                {filteredAndSortedStocks.map((stock: any) => {
                  const capFormatted = stock.market_cap 
                    ? (stock.market_cap / 1e12).toFixed(1) + " T"
                    : "-";
                  
                  return (
                    <tr key={stock.ticker} className="hover:bg-white/5 transition-colors duration-150">
                      <td className="py-4 px-4 font-bold text-accent-cyan">{stock.ticker}</td>
                      <td className="py-4 px-4 text-gray-300">{stock.name}</td>
                      <td className="py-4 px-4 text-gray-400 text-xs">{stock.sector || "-"}</td>
                      <td className="py-4 px-4 text-right font-medium text-white">
                        Rp {stock.close ? stock.close.toLocaleString('id-ID') : "0"}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-white">{capFormatted}</td>
                      <td className="py-4 px-4 text-right text-gray-300">
                        {stock.roe !== undefined && stock.roe !== null ? stock.roe.toFixed(1) + "%" : "-"}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-300">
                        {stock.per !== undefined && stock.per !== null ? stock.per.toFixed(1) : "-"}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-300">
                        {stock.pbv !== undefined && stock.pbv !== null ? stock.pbv.toFixed(1) : "-"}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-300">
                        {stock.der !== undefined && stock.der !== null ? stock.der.toFixed(2) : "-"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 rounded bg-accent-purple/20 border border-accent-purple/30 text-accent-purple font-bold">
                          {stock.ai_score}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={"px-2 py-0.5 rounded-full text-xs font-semibold border " + (
                          stock.recommendation === "Strong Buy" 
                            ? "bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30"
                            : stock.recommendation === "Buy"
                            ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30"
                            : stock.recommendation === "Hold"
                            ? "bg-accent-amber/20 text-accent-amber border-accent-amber/30"
                            : "bg-accent-rose/20 text-accent-rose border-accent-rose/30"
                        )}>
                          {stock.recommendation}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
