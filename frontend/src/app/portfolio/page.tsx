"use client";

import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  History,
  Plus,
  Trash2,
  X,
  Loader2
} from "lucide-react";

interface Position {
  ticker: string;
  shares: number;
  avgPrice: number;
}

export default function Portfolio() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [formTicker, setFormTicker] = useState("");
  const [formShares, setFormShares] = useState(100);
  const [formPrice, setFormPrice] = useState(1000);
  const [errorMsg, setErrorMsg] = useState("");

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("sinyalai_portfolio");
    if (saved) {
      setPositions(JSON.parse(saved));
    } else {
      const defaultPositions = [
        { ticker: "BBCA", shares: 1500, avgPrice: 9800 },
        { ticker: "TLKM", shares: 5000, avgPrice: 3300 },
        { ticker: "ADRO", shares: 4500, avgPrice: 2400 }
      ];
      setPositions(defaultPositions);
      localStorage.setItem("sinyalai_portfolio", JSON.stringify(defaultPositions));
    }
  }, []);

  // Fetch live prices
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
        console.error("Gagal mengambil data pasar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  const savePositions = (updated: Position[]) => {
    setPositions(updated);
    localStorage.setItem("sinyalai_portfolio", JSON.stringify(updated));
  };

  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTicker = formTicker.trim().toUpperCase();
    if (!cleanTicker) return;

    const existsInMarket = marketData.some(s => s.ticker === cleanTicker);
    if (!existsInMarket) {
      setErrorMsg(`Saham ${cleanTicker} tidak ditemukan di database.`);
      return;
    }

    if (formShares <= 0 || formPrice <= 0) {
      setErrorMsg("Shares dan Buy Price harus bernilai positif.");
      return;
    }

    // Periksa jika sudah ada, hitung rata-rata baru (average down/up)
    const existingIndex = positions.findIndex(p => p.ticker === cleanTicker);
    let updated: Position[] = [];
    if (existingIndex > -1) {
      const existing = positions[existingIndex];
      const newShares = existing.shares + formShares;
      const newAvgPrice = Math.round(
        (existing.shares * existing.avgPrice + formShares * formPrice) / newShares
      );
      updated = [...positions];
      updated[existingIndex] = {
        ticker: cleanTicker,
        shares: newShares,
        avgPrice: newAvgPrice
      };
    } else {
      updated = [...positions, { ticker: cleanTicker, shares: formShares, avgPrice: formPrice }];
    }

    savePositions(updated);
    setShowAddModal(false);
    setFormTicker("");
    setFormShares(100);
    setFormPrice(1000);
    setErrorMsg("");
  };

  const handleRemovePosition = (tickerToRemove: string) => {
    const updated = positions.filter(p => p.ticker !== tickerToRemove);
    savePositions(updated);
  };

  // Kalkulasi Keuangan Portofolio
  const mappedPositions = positions.map(pos => {
    const stockInfo = marketData.find(s => s.ticker === pos.ticker);
    const currentPrice = stockInfo ? stockInfo.close : pos.avgPrice; // Fallback jika tidak ada data pasar
    const marketValue = pos.shares * currentPrice;
    const costBasis = pos.shares * pos.avgPrice;
    const pnl = marketValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    
    return {
      ...pos,
      currentPrice,
      marketValue,
      costBasis,
      pnl,
      pnlPercent
    };
  });

  const totalValue = mappedPositions.reduce((acc, p) => acc + p.marketValue, 0);
  const totalCost = mappedPositions.reduce((acc, p) => acc + p.costBasis, 0);
  const totalGain = totalValue - totalCost;
  const gainPercentage = totalCost > 0 ? (totalGain / totalCost) * 100 : 0.0;

  // AI Rebalancing Suggestion
  let rebalanceMessage = "Portfolio Anda sudah ter-diversifikasi dengan sangat baik. AI menyarankan untuk mempertahankan alokasi saat ini.";
  let alertHeader = "AI Portfolio Balanced";
  let alertColor = "border-accent-emerald/20 bg-gradient-to-br from-black/40 to-accent-emerald/5";
  
  const financialCount = mappedPositions.filter(p => {
    const stockInfo = marketData.find(s => s.ticker === p.ticker);
    return stockInfo && stockInfo.sector === "Financials";
  }).length;

  if (financialCount > 2) {
    alertHeader = "AI Re-balance Alert";
    rebalanceMessage = "Portfolio Anda memiliki eksposur sektor Perbankan/Financials yang tinggi. Pertimbangkan untuk merealisasikan profit (taking profit) pada saham perbankan Anda.";
    alertColor = "border-accent-rose/20 bg-gradient-to-br from-black/40 to-accent-rose/5";
  }

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
        
        <button 
          onClick={() => { setShowAddModal(true); setErrorMsg(""); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-emerald hover:bg-accent-emerald/80 text-black text-sm font-semibold transition shadow-lg shadow-accent-emerald/25"
        >
          <Plus className="w-4 h-4" />
          Add Buy Transaction
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
          <span>Memuat portofolio...</span>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Wallet className="w-24 h-24 text-accent-cyan" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Total Equity Value</p>
              <h3 className="text-3xl font-bold text-white mt-2">Rp {totalValue.toLocaleString('id-ID')}</h3>
              <p className="text-gray-500 text-xs mt-2 font-medium">
                Asset Count: {positions.length} Saham Aktif
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                <TrendingUp className="w-24 h-24 text-accent-emerald" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Total Unrealized PnL</p>
              <h3 className={`text-3xl font-bold mt-2 flex items-center gap-2 ${totalGain >= 0 ? "text-accent-emerald" : "text-accent-rose"}`}>
                {totalGain >= 0 ? "+" : ""}Rp {totalGain.toLocaleString('id-ID')}
              </h3>
              <p className={`text-xs mt-2 flex items-center gap-1 font-semibold ${totalGain >= 0 ? "text-accent-emerald" : "text-accent-rose"}`}>
                {totalGain >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {totalGain >= 0 ? "+" : ""}{gainPercentage.toFixed(2)}% All Time
              </p>
            </div>

            <div className={`glass-card rounded-2xl p-6 border ${alertColor}`}>
              <h3 className="text-white font-bold mb-1.5 flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-accent-emerald" />
                {alertHeader}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                {rebalanceMessage}
              </p>
            </div>
          </div>

          {/* Two Column Layout for Positions and Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Positions Table (Span 2) */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Current Positions</h3>
              <div className="overflow-x-auto">
                {mappedPositions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    Belum ada posisi portofolio yang terisi.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                        <th className="py-4 px-4">Asset</th>
                        <th className="py-4 px-4 text-right">Shares</th>
                        <th className="py-4 px-4 text-right">Avg Price</th>
                        <th className="py-4 px-4 text-right">Last Price</th>
                        <th className="py-4 px-4 text-right">Total Value</th>
                        <th className="py-4 px-4 text-right">Unrealized PnL</th>
                        <th className="py-4 px-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {mappedPositions.map((pos, i) => {
                        const isProfit = pos.pnl >= 0;

                        return (
                          <tr key={i} className="hover:bg-white/5 transition-colors duration-150">
                            <td className="py-4 px-4 font-bold text-accent-cyan">{pos.ticker}</td>
                            <td className="py-4 px-4 text-right text-gray-300">{pos.shares.toLocaleString()}</td>
                            <td className="py-4 px-4 text-right text-gray-400">Rp {pos.avgPrice.toLocaleString()}</td>
                            <td className="py-4 px-4 text-right font-medium text-white">Rp {pos.currentPrice.toLocaleString()}</td>
                            <td className="py-4 px-4 text-right font-medium text-white">Rp {pos.marketValue.toLocaleString()}</td>
                            <td className="py-4 px-4 text-right">
                              <div className={"font-bold " + (isProfit ? "text-accent-emerald" : "text-accent-rose")}>
                                {isProfit ? "+" : ""}Rp {pos.pnl.toLocaleString()}
                              </div>
                              <div className={"text-xs " + (isProfit ? "text-accent-emerald/70" : "text-accent-rose/70")}>
                                {isProfit ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button 
                                onClick={() => handleRemovePosition(pos.ticker)}
                                className="p-2 text-gray-500 hover:text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors"
                                title="Hapus Posisi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Allocation Sidebar */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent-purple" />
                Asset Allocation
              </h3>
              
              <div className="space-y-4">
                {mappedPositions.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">Belum ada alokasi aset.</p>
                ) : (
                  mappedPositions.map((pos, i) => {
                    const allocation = totalValue > 0 ? ((pos.marketValue / totalValue) * 100) : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1.5 text-xs">
                          <span className="font-semibold text-gray-300">{pos.ticker}</span>
                          <span className="text-gray-400">{allocation.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-gradient-to-r from-accent-purple to-accent-cyan"
                            style={{ width: `${allocation}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                 <h4 className="text-sm font-bold text-white mb-3 text-xs uppercase tracking-wider text-gray-500">AI Diversification Rating</h4>
                 <div className="flex items-center gap-4">
                   <div className="text-3xl font-black text-accent-cyan">
                     {financialCount > 2 ? "B-" : positions.length >= 4 ? "A" : "A-"}
                   </div>
                   <p className="text-xs text-gray-400 leading-relaxed">
                     {financialCount > 2 
                       ? "Portofolio terlalu berat pada sektor finansial perbankan." 
                       : positions.length >= 4 
                       ? "Sangat diversifikasi. Eksposur risiko sektoral tersebar rata." 
                       : "Diversifikasi moderat. Pertimbangkan tambah 1-2 emiten sektor lain."}
                   </p>
                 </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Add Position Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 relative border border-border">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-white mb-2">Tambah Posisi Saham</h3>
            <p className="text-xs text-gray-400 mb-6">
              Catat transaksi pembelian saham untuk melacak keuntungan portofolio Anda.
            </p>

            <form onSubmit={handleAddPosition} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Ticker Saham</label>
                <input 
                  type="text" 
                  placeholder="Contoh: BBRI, ADRO, GOTO" 
                  value={formTicker}
                  onChange={(e) => setFormTicker(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                  maxLength={4}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Shares (Lembar)</label>
                  <input 
                    type="number" 
                    value={formShares}
                    onChange={(e) => setFormShares(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Buy Price (Rp/Share)</label>
                  <input 
                    type="number" 
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                  />
                </div>
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
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
