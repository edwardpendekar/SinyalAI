import { 
  Globe,
  Search,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CalendarDays
} from "lucide-react";

export default function ForeignFlow() {
  const foreignData = [
    { date: "20 Aug 2026", netVolume: "+450,000", netValue: "+Rp 450.5 M", action: "Accumulation", priceChange: "+1.5%" },
    { date: "19 Aug 2026", netVolume: "+320,000", netValue: "+Rp 318.2 M", action: "Accumulation", priceChange: "+0.8%" },
    { date: "18 Aug 2026", netVolume: "-15,000", netValue: "-Rp 14.8 M", action: "Distribution", priceChange: "-0.2%" },
    { date: "17 Aug 2026", netVolume: "+125,000", netValue: "+Rp 126.0 M", action: "Accumulation", priceChange: "+0.5%" },
    { date: "16 Aug 2026", netVolume: "-850,000", netValue: "-Rp 842.1 M", action: "Distribution", priceChange: "-2.1%" },
  ];

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <p className="text-gray-400 text-sm font-medium mb-1">Net Foreign (1 Week)</p>
          <h3 className="text-3xl font-bold text-accent-emerald flex items-center gap-2">
            +Rp 825.4 M
          </h3>
          <p className="text-gray-500 text-xs mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3 text-accent-emerald" /> Massive Accumulation Phase
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <p className="text-gray-400 text-sm font-medium mb-1">Foreign Ownership</p>
          <h3 className="text-3xl font-bold text-white flex items-center gap-2">
            78.5%
          </h3>
          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-3">
             <div className="bg-[#3b82f6] h-1.5 rounded-full" style={{ width: '78.5%' }}></div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-black/40 to-[#3b82f6]/10 border border-[#3b82f6]/20">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">
             <ArrowRightLeft className="w-4 h-4 text-[#3b82f6]" />
             AI Flow Interpretation
          </h3>
          <p className="text-gray-400 text-xs">
            Terjadi divergensi positif: Harga sempat terkoreksi kecil, namun Asing terus melakukan <span className="text-accent-emerald font-bold">Net Buy</span>. Ini adalah sinyal *Hidden Bullish* yang kuat.
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
                  <th className="py-3 px-4 text-right">Price %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {foreignData.map((item, i) => {
                  const isAcc = item.action === 'Accumulation';
                  return (
                    <tr key={i} className="hover:bg-white/5 transition-colors duration-150">
                      <td className="py-4 px-4 text-gray-300 whitespace-nowrap flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-500" />
                        {item.date}
                      </td>
                      <td className={"py-4 px-4 text-right font-bold " + (isAcc ? "text-accent-emerald" : "text-accent-rose")}>
                        {item.netVolume}
                      </td>
                      <td className={"py-4 px-4 text-right font-bold " + (isAcc ? "text-accent-emerald" : "text-accent-rose")}>
                        {item.netValue}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase " + (isAcc ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20" : "bg-accent-rose/10 text-accent-rose border border-accent-rose/20")}>
                          {item.action}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-400 font-medium">
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
            {foreignData.slice().reverse().map((data, i) => {
               const isAcc = data.action === 'Accumulation';
               const valueStr = data.netValue.replace(/[^\d.-]/g, '');
               const val = Math.abs(parseFloat(valueStr));
               const maxVal = 850;
               const heightPercent = Math.max((val / maxVal) * 100, 5); // min 5% height

               return (
                 <div key={i} className="flex flex-col items-center gap-3 w-8 relative group">
                   <div 
                     className={"w-full rounded-t-sm transition-all " + (isAcc ? "bg-accent-emerald" : "bg-accent-rose")} 
                     style={{ height: heightPercent + '%' }}
                   ></div>
                 </div>
               );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
             <span>Older</span>
             <span>Recent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
