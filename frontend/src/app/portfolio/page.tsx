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
  Loader2,
  Coins,
  Layers
} from "lucide-react";

interface Position {
  ticker: string;
  shares: number;
  avgPrice: number;
}

interface OtherAsset {
  id: string;
  name: string;
  value: number;
}

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState<"stocks" | "other">("stocks");
  const [positions, setPositions] = useState<Position[]>([]);
  const [otherAssets, setOtherAssets] = useState<OtherAsset[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  
  // Forms
  const [formTicker, setFormTicker] = useState("");
  const [formShares, setFormShares] = useState(100);
  const [formPrice, setFormPrice] = useState(1000);
  const [formAssetName, setFormAssetName] = useState("");
  const [formAssetValue, setFormAssetValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Load from LocalStorage
  useEffect(() => {
    // 1. Stock positions dari keuangan.sql
    const savedStocks = localStorage.getItem("sinyalai_portfolio");
    if (savedStocks) {
      setPositions(JSON.parse(savedStocks));
    } else {
      const defaultPositions = [
        { ticker: "DMAS", shares: 21600, avgPrice: 209 },
        { ticker: "DMMX", shares: 2100, avgPrice: 2403 },
        { ticker: "BBKP", shares: 1000, avgPrice: 299 }
      ];
      setPositions(defaultPositions);
      localStorage.setItem("sinyalai_portfolio", JSON.stringify(defaultPositions));
    }

    // 2. Non-stock assets dari keuangan.sql
    const savedAssets = localStorage.getItem("sinyalai_other_assets");
    if (savedAssets) {
      setOtherAssets(JSON.parse(savedAssets));
    } else {
      const defaultAssets = [
        { id: "1", name: "P2P Lending (Easycash, Koinworks)", value: 145161899 },
        { id: "2", name: "Dana Cadangan (Bank BCA)", value: 33302347 },
        { id: "3", name: "Bisnis Crowdfunding (Sukuk, Zenbu)", value: 7549671 },
        { id: "4", name: "Reksadana (Bibit)", value: 6261618 },
        { id: "5", name: "Koperasi (Bibit)", value: 6195942 },
        { id: "6", name: "Dollar (eToro, gotrade)", value: 1656391 },
        { id: "7", name: "Emas", value: 502879 }
      ];
      setOtherAssets(defaultAssets);
      localStorage.setItem("sinyalai_other_assets", JSON.stringify(defaultAssets));
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

  const saveOtherAssets = (updated: OtherAsset[]) => {
    setOtherAssets(updated);
    localStorage.setItem("sinyalai_other_assets", JSON.stringify(updated));
  };

  const handleAddStock = (e: React.FormEvent) => {
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
    setShowAddStockModal(false);
    setFormTicker("");
    setFormShares(100);
    setFormPrice(1000);
    setErrorMsg("");
  };

  const handleRemoveStock = (tickerToRemove: string) => {
    const updated = positions.filter(p => p.ticker !== tickerToRemove);
    savePositions(updated);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formAssetName.trim();
    const valueNum = parseFloat(formAssetValue);

    if (!cleanName || isNaN(valueNum) || valueNum <= 0) {
      setErrorMsg("Nama aset dan nilai harus diisi secara valid.");
      return;
    }

    const newAsset: OtherAsset = {
      id: Date.now().toString(),
      name: cleanName,
      value: valueNum
    };

    const updated = [...otherAssets, newAsset];
    saveOtherAssets(updated);
    setShowAddAssetModal(false);
    setFormAssetName("");
    setFormAssetValue("");
    setErrorMsg("");
  };

  const handleRemoveAsset = (idToRemove: string) => {
    const updated = otherAssets.filter(a => a.id !== idToRemove);
    saveOtherAssets(updated);
  };

  // Kalkulasi Keuangan Saham
  const mappedPositions = positions.map(pos => {
    const stockInfo = marketData.find(s => s.ticker === pos.ticker);
    const currentPrice = stockInfo ? stockInfo.close : pos.avgPrice;
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

  const totalStockValue = mappedPositions.reduce((acc, p) => acc + p.marketValue, 0);
  const totalStockCost = mappedPositions.reduce((acc, p) => acc + p.costBasis, 0);
  const totalStockGain = totalStockValue - totalStockCost;
  const stockGainPercent = totalStockCost > 0 ? (totalStockGain / totalStockCost) * 100 : 0.0;

  // Kalkulasi Keuangan Aset Lainnya
  const totalOtherValue = otherAssets.reduce((acc, a) => acc + a.value, 0);

  // Total Nilai Bersih Kekayaan (Net Worth)
  const totalNetWorth = totalStockValue + totalOtherValue;

  // AI Rebalancing Suggestion
  let rebalanceMessage = "Portfolio aset Anda terbagi proporsional. AI menyarankan untuk menjaga likuiditas dana cadangan (BCA) Anda.";
  let alertHeader = "AI Net Worth Optimal";
  let alertColor = "border-accent-emerald/20 bg-gradient-to-br from-black/40 to-accent-emerald/5";

  if (totalStockValue > totalNetWorth * 0.5) {
    alertHeader = "AI Risk Alert";
    rebalanceMessage = "Eksposur aset saham Anda melebihi 50% dari total kekayaan. Pertimbangkan diversifikasi ke P2P Lending atau dana cadangan.";
    alertColor = "border-accent-rose/20 bg-gradient-to-br from-black/40 to-accent-rose/5";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-accent-emerald" />
            AI Managed Portfolio &amp; Assets
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Ringkasan aset, keuntungan/kerugian (PnL), dan alokasi kekayaan riil dari keuangan pribadi Anda.
          </p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === "stocks" ? (
            <button 
              onClick={() => { setShowAddStockModal(true); setErrorMsg(""); }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-emerald hover:bg-accent-emerald/80 text-black text-xs font-bold transition shadow-lg shadow-accent-emerald/25"
            >
              <Plus className="w-4 h-4" />
              Add Stock Position
            </button>
          ) : (
            <button 
              onClick={() => { setShowAddAssetModal(true); setErrorMsg(""); }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-cyan hover:bg-accent-cyan/80 text-black text-xs font-bold transition shadow-lg shadow-accent-cyan/25"
            >
              <Plus className="w-4 h-4" />
              Add Other Asset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
          <span>Memuat ringkasan kekayaan...</span>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Wallet className="w-24 h-24 text-accent-cyan" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Total Net Worth (Kekayaan Bersih)</p>
              <h3 className="text-3xl font-bold text-white mt-2">Rp {totalNetWorth.toLocaleString('id-ID')}</h3>
              <p className="text-gray-500 text-xs mt-2 font-medium">
                Stocks: Rp {totalStockValue.toLocaleString('id-ID')} | Lainnya: Rp {totalOtherValue.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                <TrendingUp className="w-24 h-24 text-accent-emerald" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Stock Unrealized PnL</p>
              <h3 className={`text-3xl font-bold mt-2 flex items-center gap-2 ${totalStockGain >= 0 ? "text-accent-emerald" : "text-accent-rose"}`}>
                {totalStockGain >= 0 ? "+" : ""}Rp {totalStockGain.toLocaleString('id-ID')}
              </h3>
              <p className={`text-xs mt-2 flex items-center gap-1 font-semibold ${totalStockGain >= 0 ? "text-accent-emerald" : "text-accent-rose"}`}>
                {totalStockGain >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {totalStockGain >= 0 ? "+" : ""}{stockGainPercent.toFixed(2)}% All Time
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

          {/* Navigation Tabs */}
          <div className="flex border-b border-border gap-6 text-sm">
            <button 
              onClick={() => setActiveTab("stocks")}
              className={`pb-3 font-semibold transition ${
                activeTab === "stocks" ? "text-accent-cyan border-b-2 border-accent-cyan" : "text-gray-400 hover:text-white"
              }`}
            >
              Saham ({positions.length})
            </button>
            <button 
              onClick={() => setActiveTab("other")}
              className={`pb-3 font-semibold transition ${
                activeTab === "other" ? "text-accent-cyan border-b-2 border-accent-cyan" : "text-gray-400 hover:text-white"
              }`}
            >
              Aset Lainnya ({otherAssets.length})
            </button>
          </div>

          {/* Two Column Layout for Positions and Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Content Area (Span 2) */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
              {activeTab === "stocks" ? (
                <>
                  <h3 className="text-lg font-bold text-white mb-6">Stock Positions</h3>
                  <div className="overflow-x-auto">
                    {mappedPositions.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        Belum ada posisi saham yang terisi.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                            <th className="py-4 px-4">Asset</th>
                            <th className="py-4 px-4 text-right">Shares (Lot)</th>
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
                                <td className="py-4 px-4 text-right text-gray-300">
                                  {pos.shares.toLocaleString()} ({(pos.shares/100).toFixed(0)})
                                </td>
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
                                    onClick={() => handleRemoveStock(pos.ticker)}
                                    className="p-2 text-gray-500 hover:text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors"
                                    title="Hapus Saham"
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
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-white mb-6">Other Asset Classes</h3>
                  <div className="overflow-x-auto">
                    {otherAssets.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        Belum ada aset non-saham terdaftar.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                            <th className="py-4 px-4">Nama Aset</th>
                            <th className="py-4 px-4 text-right">Nilai Aset (Rupiah)</th>
                            <th className="py-4 px-4 text-right">Porsi Alokasi (%)</th>
                            <th className="py-4 px-4"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                          {otherAssets.map((asset) => {
                            const alloc = totalNetWorth > 0 ? ((asset.value / totalNetWorth) * 100) : 0;
                            return (
                              <tr key={asset.id} className="hover:bg-white/5 transition-colors duration-150">
                                <td className="py-4 px-4 font-bold text-white">{asset.name}</td>
                                <td className="py-4 px-4 text-right text-gray-300 font-semibold">Rp {asset.value.toLocaleString('id-ID')}</td>
                                <td className="py-4 px-4 text-right text-gray-400 font-medium">{alloc.toFixed(1)}%</td>
                                <td className="py-4 px-4 text-right">
                                  <button 
                                    onClick={() => handleRemoveAsset(asset.id)}
                                    className="p-2 text-gray-500 hover:text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors"
                                    title="Hapus Aset"
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
                </>
              )}
            </div>

            {/* Allocation Sidebar */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent-purple" />
                Asset Allocation
              </h3>
              
              <div className="space-y-4">
                {activeTab === "stocks" ? (
                  mappedPositions.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">Belum ada alokasi aset saham.</p>
                  ) : (
                    mappedPositions.map((pos, i) => {
                      const allocation = totalStockValue > 0 ? ((pos.marketValue / totalStockValue) * 100) : 0;
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
                  )
                ) : (
                  otherAssets.map((asset) => {
                    const allocation = totalOtherValue > 0 ? ((asset.value / totalOtherValue) * 100) : 0;
                    return (
                      <div key={asset.id}>
                        <div className="flex justify-between items-center mb-1.5 text-xs">
                          <span className="font-semibold text-gray-300 truncate max-w-[180px]">{asset.name}</span>
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
                     {totalStockValue > totalNetWorth * 0.4 ? "A-" : "A"}
                   </div>
                   <p className="text-xs text-gray-400 leading-relaxed">
                     {totalStockValue > totalNetWorth * 0.4
                       ? "Porsi dana saham cukup besar. Disarankan untuk membatasi porsi saham maksimal 40% dari total kekayaan bersih."
                       : "Distribusi portofolio sangat sehat. Diversifikasi aset tersebar merata di berbagai kelas instrumen keuangan."}
                   </p>
                 </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Add Stock Position Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 relative border border-border">
            <button 
              onClick={() => setShowAddStockModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-white mb-2">Tambah Posisi Saham</h3>
            <p className="text-xs text-gray-400 mb-6">
              Catat transaksi pembelian saham untuk melacak keuntungan portofolio Anda.
            </p>

            <form onSubmit={handleAddStock} className="space-y-4">
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
                  required
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Buy Price (Rp/Share)</label>
                  <input 
                    type="number" 
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                    required
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
                  onClick={() => setShowAddStockModal(false)}
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

      {/* Add Other Asset Modal */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 relative border border-border">
            <button 
              onClick={() => setShowAddAssetModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-white mb-2">Tambah Aset Baru</h3>
            <p className="text-xs text-gray-400 mb-6">
              Catat instrumen keuangan non-saham Anda (misal: Emas, P2P Lending, Reksadana, Tabungan).
            </p>

            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Nama Aset / Bank / Instrumen</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Emas Antam, Bibit Reksadana, Bank BCA" 
                  value={formAssetName}
                  onChange={(e) => setFormAssetName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Nilai Total Aset (Rupiah)</label>
                <input 
                  type="number" 
                  placeholder="Contoh: 5000000" 
                  value={formAssetValue}
                  onChange={(e) => setFormAssetValue(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                  required
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
                  onClick={() => setShowAddAssetModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-gray-400 hover:text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-accent-cyan hover:bg-accent-cyan/80 text-black text-xs font-bold transition shadow-lg shadow-accent-cyan/25"
                >
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
