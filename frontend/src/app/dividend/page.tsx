import { 
  Coins,
  Search,
  CalendarDays,
  TrendingUp,
  Percent,
  ShieldCheck,
  Building2
} from "lucide-react";

export default function Dividend() {
  const dividendHistory = [
    { year: "2024", type: "Final", amount: 227.5, exDate: "05 Apr 2024", paymentDate: "25 Apr 2024", yield: "2.23%" },
    { year: "2023", type: "Interim", amount: 42.5, exDate: "01 Dec 2023", paymentDate: "20 Dec 2023", yield: "0.45%" },
    { year: "2023", type: "Final", amount: 170.0, exDate: "30 Mar 2023", paymentDate: "18 Apr 2023", yield: "1.98%" },
    { year: "2022", type: "Interim", amount: 35.0, exDate: "02 Dec 2022", paymentDate: "20 Dec 2022", yield: "0.41%" },
    { year: "2022", type: "Final", amount: 120.0, exDate: "25 Mar 2022", paymentDate: "19 Apr 2022", yield: "1.52%" },
    { year: "2021", type: "Interim", amount: 25.0, exDate: "26 Nov 2021", paymentDate: "15 Dec 2021", yield: "0.33%" },
  ];

  const chartData = [
    { year: "2020", total: 110.5 },
    { year: "2021", total: 125.0 },
    { year: "2022", total: 155.0 },
    { year: "2023", total: 212.5 },
    { year: "2024", total: 270.0 }, // Interim (est) + Final
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Stats Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded-full bg-accent-amber/20 border border-accent-amber/30 flex items-center justify-center mb-4">
               <Building2 className="w-8 h-8 text-accent-amber" />
             </div>
             <h3 className="text-3xl font-black text-white">BBCA</h3>
             <p className="text-gray-400 font-medium text-sm">Bank Central Asia Tbk.</p>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent-emerald/20 text-accent-emerald">
                <Percent className="w-4 h-4" />
              </div>
              <p className="text-sm text-gray-400">Dividend Yield (TTM)</p>
            </div>
            <h4 className="text-2xl font-bold text-white">2.68%</h4>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent-cyan/20 text-accent-cyan">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-sm text-gray-400">5-Yr CAGR Growth</p>
            </div>
            <h4 className="text-2xl font-bold text-white">19.5%</h4>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent-purple/20 text-accent-purple">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-sm text-gray-400">Payout Ratio</p>
            </div>
            <h4 className="text-2xl font-bold text-white">45.2%</h4>
            <div className="w-full bg-gray-800 rounded-full h-1.5 mt-3">
               <div className="bg-accent-purple h-1.5 rounded-full" style={{ width: '45.2%' }}></div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* AI Sustainability Analysis */}
          <div className="glass-card rounded-2xl p-6 border border-accent-emerald/30 bg-gradient-to-br from-black/40 to-accent-emerald/5">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent-emerald" />
              AI Dividend Safety Score: Sangat Aman (94/100)
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Kapasitas pembayaran dividen BBCA tergolong **Sangat Aman**. Payout ratio berada di level moderat (45.2%), sehingga perusahaan memiliki cukup kas ditahan (retained earnings) untuk ekspansi modal tanpa membahayakan rutinitas pembayaran dividen di masa depan. Proyeksi AI mengindikasikan peluang 92% perusahaan akan menaikkan dividen pada tahun fiskal berikutnya.
            </p>
          </div>

          {/* Dividend Growth Chart */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Dividend Growth History (Rp/Share)</h3>
            <div className="flex items-end justify-between h-48 px-2 md:px-8">
              {chartData.map((data, i) => {
                const maxTotal = 270.0;
                const heightPercent = (data.total / maxTotal) * 100;
                return (
                  <div key={i} className="flex flex-col items-center gap-3 w-12 md:w-16">
                    <div className="w-full bg-accent-amber/80 hover:bg-accent-amber rounded-t-md transition-all relative group flex flex-col justify-end" style={{ height: heightPercent + '%' }}>
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-white font-bold text-xs">
                        {data.total}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{data.year}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dividend History Table */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Historical Payments</h3>
            <div className="overflow-x-auto">
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
                  {dividendHistory.map((item, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors duration-150">
                      <td className="py-4 px-4 font-bold text-white">{item.year}</td>
                      <td className="py-4 px-4">
                        <span className={"inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase " + (item.type === 'Final' ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20' : 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20')}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-accent-amber">{item.amount.toFixed(1)}</td>
                      <td className="py-4 px-4 text-gray-300 flex items-center gap-2 whitespace-nowrap">
                        <CalendarDays className="w-3.5 h-3.5 text-gray-500" />
                        {item.exDate}
                      </td>
                      <td className="py-4 px-4 text-gray-300 whitespace-nowrap">{item.paymentDate}</td>
                      <td className="py-4 px-4 text-right text-gray-400">{item.yield}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
