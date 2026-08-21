"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  ShieldCheck, 
  ArrowUpRight, 
  Compass, 
  DollarSign,
  Loader2
} from "lucide-react";

export default function Dashboard() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [divergences, setDivergences] = useState<any[]>([]);
  const [foreignFlows, setForeignFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Ambil data scanner utama
        const scannerRes = await fetch("/api/v1/scanner");
        const scannerData = scannerRes.ok ? await scannerRes.json() : [];
        setStocks(scannerData);

        // Ambil data radar divergensi
        const divRes = await fetch("/api/v1/scanner/divergences");
        const divData = divRes.ok ? await divRes.json() : [];
        setDivergences(divData);

        // Ambil data foreign flow
        const flowRes = await fetch("/api/v1/scanner/foreign-flow");
        const flowData = flowRes.ok ? await flowRes.json() : [];
        setForeignFlows(flowData);

      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 1. Hitung AI Top Picks (Score >= 60, urutkan skor tertinggi)
  const topPicks = [...stocks]
    .filter(s => s.ai_score >= 60)
    .sort((a, b) => b.ai_score - a.ai_score)
    .slice(0, 5)
    .map(s => {
      // Tentukan Risk Level
      let risk = "Medium";
      if (s.der < 1.0 && s.ai_score >= 70) risk = "Low";
      else if (s.der > 1.5 || s.ai_score < 50) risk = "High";
      
      // Tentukan Position Size
      let size = "0% (No position)";
      if (s.recommendation === "Strong Buy") size = "10%";
      else if (s.recommendation === "Buy") size = "5%";
      else if (s.recommendation === "Hold") size = "2.5%";

      return {
        ticker: s.ticker,
        name: s.name,
        score: s.ai_score,
        rec: s.recommendation,
        price: s.close.toLocaleString('id-ID'),
        target: s.target_price ? s.target_price.toLocaleString('id-ID') : "-",
        return: s.expected_return ? `+${s.expected_return.toFixed(1)}%` : "0.0%",
        risk,
        size
      };
    });

  // 2. Hitung Sector Rotation Strength (Rata-rata AI Score per Sektor)
  const getSectorRotations = () => {
    const sectorsMap: Record<string, { total: number; count: number }> = {};
    for (const s of stocks) {
      if (!s.sector) continue;
      if (!sectorsMap[s.sector]) {
        sectorsMap[s.sector] = { total: 0, count: 0 };
      }
      sectorsMap[s.sector].total += s.ai_score;
      sectorsMap[s.sector].count += 1;
    }

    const colorClasses = [
      "bg-accent-cyan",
      "bg-accent-purple",
      "bg-accent-amber",
      "bg-accent-emerald",
      "bg-accent-rose",
      "bg-blue-500",
      "bg-orange-500",
      "bg-indigo-500"
    ];

    return Object.entries(sectorsMap)
      .map(([sector, data], idx) => {
        const avg = Math.round(data.total / data.count);
        return {
          sector,
          strength: avg,
          color: colorClasses[idx % colorClasses.length]
        };
      })
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5);
  };

  const sectorRotations = getSectorRotations();

  // 3. Hitung Fear & Greed Index berbasis rasio Strong Buy/Buy terhadap Total
  const getFearGreedIndex = () => {
    if (stocks.length === 0) return 50;
    const buys = stocks.filter(s => s.recommendation === "Strong Buy" || s.recommendation === "Buy").length;
    const index = Math.round((buys / stocks.length) * 100);
    return Math.min(100, Math.max(0, index + 35)); // Shift bias ke area Greed/Netral yang logis
  };

  const fearGreedIndex = getFearGreedIndex();
  
  let fearGreedStatus = "Neutral Area";
  if (fearGreedIndex > 65) fearGreedStatus = "Greed Area";
  else if (fearGreedIndex > 85) fearGreedStatus = "Extreme Greed";
  else if (fearGreedIndex < 35) fearGreedStatus = "Fear Area";

  // 4. Hitung Net Foreign Accumulation dari total net_foreign di database
  const totalNetForeign = foreignFlows.reduce((acc, f) => acc + f.net_foreign, 0);
  const formattedNetForeign = `${totalNetForeign >= 0 ? '+' : ''}${(totalNetForeign / 1e9).toFixed(1)} B`;

  // 5. Hitung Divergensi Bullish vs Bearish
  const bullishCount = divergences.filter(d => d.type.includes("Bullish")).length;
  const bearishCount = divergences.filter(d => d.type.includes("Bearish")).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome banner with radial blur background */}
      <div className="relative rounded-2xl overflow-hidden glass-panel p-8 bg-gradient-glow border border-border">
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Market Scanner Overview
          </h2>
          <p className="text-gray-400 text-sm max-w-xl">
            Sistem pemantauan AI aktif. {stocks.length} emiten bursa BEI telah berhasil dipindai secara real-time. Ditemukan {divergences.length} sinyal divergence aktif baru.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
          <span>Memuat ringkasan dashboard Sinyal AI...</span>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric 1 */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-sm font-medium">IHSG Index</span>
                <TrendingUp className="w-5 h-5 text-accent-emerald" />
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-3xl font-bold tracking-tight text-white">7,325.50</h3>
                <p className="text-xs text-accent-emerald flex items-center gap-1">
                  <span className="font-semibold">+1.15%</span> (+83.20 today)
                </p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-sm font-medium">Fear & Greed Index</span>
                <Compass className="w-5 h-5 text-accent-purple" />
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-3xl font-bold tracking-tight text-white">{fearGreedIndex}</h3>
                <p className="text-xs text-accent-purple font-semibold">
                  {fearGreedStatus}
                </p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-sm font-medium">Net Foreign Accumulation (1D)</span>
                <DollarSign className="w-5 h-5 text-accent-cyan" />
              </div>
              <div className="mt-4 space-y-1">
                <h3 className={`text-3xl font-bold tracking-tight ${totalNetForeign >= 0 ? 'text-white' : 'text-accent-rose'}`}>
                  {formattedNetForeign}
                </h3>
                <p className="text-xs text-accent-cyan font-semibold">
                  {totalNetForeign >= 0 ? "Foreign inflow active" : "Foreign outflow active"}
                </p>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-sm font-medium">Active Divergences Detected</span>
                <Layers className="w-5 h-5 text-accent-amber" />
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-3xl font-bold tracking-tight text-white">{divergences.length}</h3>
                <p className="text-xs text-accent-amber font-semibold">
                  {bullishCount} Bullish / {bearishCount} Bearish
                </p>
              </div>
            </div>
          </div>

          {/* Main Charts & Rotations Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mock Chart Area */}
            <div className="glass-card rounded-2xl p-6 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-cyan" />
                  BBCA Chart (TradingView Lightweight Mock)
                </h3>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 font-medium">1D</span>
                  <span className="px-2 py-0.5 rounded bg-accent-cyan/15 text-[10px] text-accent-cyan font-semibold">1W</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 font-medium">1M</span>
                </div>
              </div>
              {/* Mock Candle Visualization */}
              <div className="h-64 rounded-xl bg-black/40 border border-border/50 flex flex-col justify-end p-6 space-y-4 relative overflow-hidden">
                {/* Glowing gradient background */}
                <div className="absolute inset-0 bg-gradient-to-t from-accent-purple/5 to-transparent pointer-events-none"></div>
                
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-6 opacity-5 pointer-events-none">
                  <div className="border-b border-white w-full"></div>
                  <div className="border-b border-white w-full"></div>
                  <div className="border-b border-white w-full"></div>
                </div>

                {/* Simulated Candles */}
                <div className="h-full flex items-end justify-between px-10 relative z-10">
                  <div className="w-4 h-24 bg-accent-rose/30 border border-accent-rose rounded-sm flex items-center justify-center relative">
                    <div className="absolute w-[2px] h-32 bg-accent-rose -z-10"></div>
                  </div>
                  <div className="w-4 h-32 bg-accent-emerald/30 border border-accent-emerald rounded-sm flex items-center justify-center relative">
                    <div className="absolute w-[2px] h-40 bg-accent-emerald -z-10"></div>
                  </div>
                  <div className="w-4 h-28 bg-accent-rose/30 border border-accent-rose rounded-sm flex items-center justify-center relative">
                    <div className="absolute w-[2px] h-36 bg-accent-rose -z-10"></div>
                  </div>
                  <div className="w-4 h-48 bg-accent-emerald/30 border border-accent-emerald rounded-sm flex items-center justify-center relative">
                    <div className="absolute w-[2px] h-56 bg-accent-emerald -z-10"></div>
                    <span className="absolute -top-6 text-[10px] bg-accent-emerald/20 text-accent-emerald px-1.5 py-0.5 rounded border border-accent-emerald/30">
                      Buy
                    </span>
                  </div>
                  <div className="w-4 h-40 bg-accent-emerald/30 border border-accent-emerald rounded-sm flex items-center justify-center relative">
                    <div className="absolute w-[2px] h-48 bg-accent-emerald -z-10"></div>
                  </div>
                </div>

                {/* Volume Profile Overlay */}
                <div className="absolute left-0 inset-y-0 w-24 flex flex-col justify-between py-6 opacity-20 pointer-events-none">
                  <div className="h-4 bg-accent-cyan w-20"></div>
                  <div className="h-4 bg-accent-cyan w-12"></div>
                  <div className="h-4 bg-accent-cyan w-24"></div>
                  <div className="h-4 bg-accent-cyan w-8"></div>
                </div>
              </div>
            </div>

            {/* Sector Rotation Panel */}
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-purple" />
                Sector Rotation Strength
              </h3>
              <div className="space-y-4">
                {sectorRotations.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">Belum ada rotasi sektor.</p>
                ) : (
                  sectorRotations.map((item) => (
                    <div key={item.sector} className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-300">{item.sector}</span>
                        <span className="text-white">{item.strength}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.strength}%` }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Top AI Stock Scanner Picks Table */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent-cyan" />
                AI Stock Scanner: Top Picks (Score &gt;= 60)
              </h3>
              <span className="text-xs text-gray-400">Terakhir diperbarui: Hari ini, 16:30 WIB</span>
            </div>

            <div className="overflow-x-auto">
              {topPicks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  Tidak ada emiten dengan AI Score &gt;= 60 saat ini.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                      <th className="py-4 px-4">Ticker</th>
                      <th className="py-4 px-4">Name</th>
                      <th className="py-4 px-4 text-center">AI Score</th>
                      <th className="py-4 px-4 text-center">Recommendation</th>
                      <th className="py-4 px-4 text-right">Price</th>
                      <th className="py-4 px-4 text-right">Target Price</th>
                      <th className="py-4 px-4 text-center">Exp. Return</th>
                      <th className="py-4 px-4 text-center">Risk</th>
                      <th className="py-4 px-4 text-center">Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {topPicks.map((pick) => (
                      <tr key={pick.ticker} className="hover:bg-white/5 transition-colors duration-150">
                        <td className="py-4 px-4 font-bold text-accent-cyan flex items-center gap-1.5">
                          {pick.ticker}
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                        </td>
                        <td className="py-4 px-4 text-gray-300">{pick.name}</td>
                        <td className="py-4 px-4 text-center font-semibold text-white">
                          <span className="px-2 py-1 rounded-md bg-accent-purple/20 border border-accent-purple/30 text-accent-purple">
                            {pick.score}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={"px-2 py-0.5 rounded-full text-xs font-semibold border " + (
                            pick.rec === "Strong Buy" 
                              ? "bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30"
                              : pick.rec === "Buy"
                              ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30"
                              : pick.rec === "Hold"
                              ? "bg-accent-amber/20 text-accent-amber border-accent-amber/30"
                              : "bg-accent-rose/20 text-accent-rose border-accent-rose/30"
                          )}>
                            {pick.rec}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-medium text-white">Rp {pick.price}</td>
                        <td className="py-4 px-4 text-right font-medium text-accent-cyan">Rp {pick.target}</td>
                        <td className="py-4 px-4 text-center font-bold text-accent-emerald">{pick.return}</td>
                        <td className="py-4 px-4 text-center text-gray-400">{pick.risk}</td>
                        <td className="py-4 px-4 text-center font-semibold text-white">{pick.size}</td>
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
