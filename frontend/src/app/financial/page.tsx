import { 
  FileSpreadsheet,
  Search,
  Building,
  BarChart4,
  DollarSign,
  Scale,
  BrainCircuit,
  Target
} from "lucide-react";

export default function Financial() {
  const financialData = {
    revenue: [
      { year: '2021', value: '79.2 T' },
      { year: '2022', value: '87.4 T' },
      { year: '2023', value: '98.5 T' },
      { year: '2024 (TTM)', value: '105.2 T' },
    ],
    netIncome: [
      { year: '2021', value: '31.4 T' },
      { year: '2022', value: '40.7 T' },
      { year: '2023', value: '48.6 T' },
      { year: '2024 (TTM)', value: '52.1 T' },
    ]
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#f59e0b]" />
            Fundamental Analysis
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Data laporan keuangan historis, rasio valuasi, dan kalkulasi nilai wajar (Fair Value) AI.
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

      {/* Company Overview Bar */}
      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-purple/20 to-accent-cyan/20 border border-border flex items-center justify-center">
             <Building className="w-8 h-8 text-white" />
           </div>
           <div>
             <h3 className="text-3xl font-black text-white">BBCA</h3>
             <p className="text-gray-400 font-medium">Bank Central Asia Tbk.</p>
           </div>
        </div>
        
        <div className="flex flex-wrap gap-6 text-left">
           <div>
             <p className="text-xs text-gray-400 mb-1">Current Price</p>
             <p className="text-xl font-bold text-white">Rp 10.200</p>
           </div>
           <div>
             <p className="text-xs text-gray-400 mb-1">Market Cap</p>
             <p className="text-xl font-bold text-white">1.262 T</p>
           </div>
           <div>
             <p className="text-xs text-gray-400 mb-1">Sector</p>
             <p className="text-lg font-bold text-gray-300">Financials</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Valuation & Ratios */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-black/40 to-[#f59e0b]/5 border-t-2 border-t-[#f59e0b]">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-[#f59e0b]" />
              AI Valuation (DCF)
            </h3>
            
            <div className="flex flex-col items-center justify-center mb-6">
              <p className="text-gray-400 text-sm mb-2">Fair Value Target</p>
              <h1 className="text-4xl font-black text-[#f59e0b] drop-shadow-md">Rp 11.450</h1>
              <span className="mt-3 px-3 py-1 rounded-full bg-accent-emerald/10 text-accent-emerald text-xs font-bold border border-accent-emerald/20">
                Undervalued by 12.2%
              </span>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Margin of Safety</span>
                <span className="text-sm font-bold text-white">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Growth Assumption</span>
                <span className="text-sm font-bold text-white">8.5% p.a</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Discount Rate (WACC)</span>
                <span className="text-sm font-bold text-white">9.2%</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-accent-cyan" />
              Key Ratios
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-black/40 rounded-xl border border-border">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">PER (TTM)</p>
                <p className="text-xl font-bold text-white">24.2x</p>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-border">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">PBV</p>
                <p className="text-xl font-bold text-white">4.8x</p>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-border">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">ROE</p>
                <p className="text-xl font-bold text-accent-emerald">19.5%</p>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-border">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">DER</p>
                <p className="text-xl font-bold text-white">0.22x</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Statements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BarChart4 className="w-5 h-5 text-accent-purple" />
              Income Statement Trend
            </h3>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-4">Total Revenue</h4>
                <div className="grid grid-cols-4 gap-2 h-32 items-end">
                  {financialData.revenue.map((data, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-full bg-accent-purple/80 hover:bg-accent-purple rounded-t-md transition-all relative group" style={{ height: (parseInt(data.value) * 0.8) + '%' }}>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity">
                          Rp {data.value}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{data.year}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-4">Net Income</h4>
                <div className="grid grid-cols-4 gap-2 h-32 items-end">
                  {financialData.netIncome.map((data, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-full bg-accent-emerald/80 hover:bg-accent-emerald rounded-t-md transition-all relative group" style={{ height: (parseInt(data.value) * 1.5) + '%' }}>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity">
                          Rp {data.value}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{data.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
          </div>

          <div className="glass-card rounded-2xl p-6">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <Target className="w-5 h-5 text-accent-cyan" />
               AI Fundamental Summary
             </h3>
             <p className="text-sm text-gray-300 leading-relaxed">
               Berdasarkan analisis fundamental mendalam, BBCA mempertahankan status <span className="font-bold text-accent-emerald">Moot Economic (Keunggulan Kompetitif)</span> yang sangat kuat dengan tingkat efisiensi (BOPO) terendah di industri perbankan. Kualitas aset membaik dengan NPL turun ke 1.7%, dan pertumbuhan laba bersih secara konsisten mencetak *All-Time High*.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
