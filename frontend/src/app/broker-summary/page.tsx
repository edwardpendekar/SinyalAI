import { 
  Users,
  Search,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Building
} from "lucide-react";

export default function BrokerSummary() {
  const topBuyers = [
    { code: "ZP", name: "Maybank Sekuritas", volume: "1,250,000", avgPrice: "10,150", value: "126.8 B" },
    { code: "KZ", name: "CLSA Sekuritas", volume: "980,000", avgPrice: "10,175", value: "99.7 B" },
    { code: "RX", name: "Macquarie Sekuritas", volume: "850,000", avgPrice: "10,120", value: "86.0 B" },
  ];

  const topSellers = [
    { code: "YP", name: "Mirae Asset", volume: "950,000", avgPrice: "10,100", value: "95.9 B" },
    { code: "PD", name: "Indo Premier", volume: "820,000", avgPrice: "10,115", value: "82.9 B" },
    { code: "CC", name: "Mandiri Sekuritas", volume: "450,000", avgPrice: "10,050", value: "45.2 B" },
  ];

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
        
        <div className="relative w-full md:w-64">
          <Search className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
          <input 
            type="text" 
            placeholder="Cari Ticker (ex: BBCA)..." 
            defaultValue="BBCA"
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-purple/50 transition-colors"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-black/60 to-accent-purple/10 border-l-4 border-accent-purple flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
           <h3 className="text-xl font-bold text-white mb-2">Kesimpulan Bandar (AI)</h3>
           <p className="text-gray-300 text-sm">
             Status hari ini: <span className="font-bold text-accent-emerald">BIG ACCUMULATION</span>. <br/>
             Broker institusi asing (ZP, KZ) melakukan pembelian agresif sementara broker ritel (YP, PD) cenderung mendistribusikan barang (jual). Rata-rata harga bandar (VWAP) berada di level 10,145.
           </p>
        </div>
        <div className="p-4 rounded-xl bg-accent-emerald/20 border border-accent-emerald/30 text-center min-w-[120px]">
           <ShieldCheck className="w-8 h-8 text-accent-emerald mx-auto mb-1" />
           <p className="text-xs text-accent-emerald font-bold uppercase tracking-wider">Safe to Follow</p>
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
                  <th className="py-3 px-2 text-right">Net Vol</th>
                  <th className="py-3 px-2 text-right">Avg Price</th>
                  <th className="py-3 px-2 text-right">Net Val</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {topBuyers.map((broker, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2">
                       <div className="flex items-center gap-2">
                         <span className="font-bold text-white w-6">{broker.code}</span>
                         <span className="text-xs text-gray-400 hidden sm:inline">{broker.name}</span>
                       </div>
                    </td>
                    <td className="py-3 px-2 text-right text-accent-emerald font-medium">{broker.volume}</td>
                    <td className="py-3 px-2 text-right text-gray-300">{broker.avgPrice}</td>
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
                  <th className="py-3 px-2 text-right">Net Vol</th>
                  <th className="py-3 px-2 text-right">Avg Price</th>
                  <th className="py-3 px-2 text-right">Net Val</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {topSellers.map((broker, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2">
                       <div className="flex items-center gap-2">
                         <span className="font-bold text-white w-6">{broker.code}</span>
                         <span className="text-xs text-gray-400 hidden sm:inline">{broker.name}</span>
                       </div>
                    </td>
                    <td className="py-3 px-2 text-right text-accent-rose font-medium">{broker.volume}</td>
                    <td className="py-3 px-2 text-right text-gray-300">{broker.avgPrice}</td>
                    <td className="py-3 px-2 text-right text-white font-bold">{broker.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
