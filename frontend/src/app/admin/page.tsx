import { 
  ShieldAlert,
  Database,
  RefreshCw,
  Server,
  Activity,
  Trash2,
  AlertTriangle
} from "lucide-react";

export default function Admin() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-accent-rose" />
          System Administration
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Kontrol server backend, eksekusi sinkronisasi data manual, dan pantau kesehatan database.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* System Health */}
        <div className="glass-card rounded-2xl p-6 border-t-2 border-t-accent-emerald">
           <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
             <Server className="w-4 h-4" />
             Backend Status
           </h3>
           <div className="flex items-center gap-4">
             <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-accent-emerald"></span>
             </div>
             <div>
                <p className="text-xl font-bold text-white">Online</p>
                <p className="text-xs text-gray-500">Uvicorn on port 8000</p>
             </div>
           </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-t-2 border-t-[#3b82f6]">
           <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
             <Database className="w-4 h-4" />
             Database Health
           </h3>
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-[#3b82f6]" />
             </div>
             <div>
                <p className="text-xl font-bold text-white">SQLite OK</p>
                <p className="text-xs text-gray-500">Size: 142.5 MB</p>
             </div>
           </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-t-2 border-t-accent-amber">
           <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
             <Activity className="w-4 h-4" />
             API Requests (24h)
           </h3>
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-accent-amber/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent-amber" />
             </div>
             <div>
                <p className="text-xl font-bold text-white">1,452 req</p>
                <p className="text-xs text-gray-500">Peak: 14:05 PM</p>
             </div>
           </div>
        </div>
      </div>

      {/* Manual Actions */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Manual Execution Engine</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-black/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-white mb-1">Force Sync Prices & Indicators</p>
              <p className="text-xs text-gray-500">Tarik data harga saham terbaru dari hari ini secara paksa (Abaikan cache).</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-[#3b82f6]/20 text-[#3b82f6] text-sm font-bold hover:bg-[#3b82f6] hover:text-white transition whitespace-nowrap flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Execute
            </button>
          </div>

          <div className="p-5 rounded-xl bg-black/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-white mb-1">Re-calculate AI Score</p>
              <p className="text-xs text-gray-500">Jalankan ulang algoritma Scoring untuk 950 emiten berdasarkan data indikator terbaru.</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-accent-purple/20 text-accent-purple text-sm font-bold hover:bg-accent-purple hover:text-white transition whitespace-nowrap flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Execute
            </button>
          </div>

          <div className="p-5 rounded-xl bg-black/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-white mb-1">Clear AI Cache & Temp Data</p>
              <p className="text-xs text-gray-500">Hapus cache model AI untuk membebaskan memory. Memerlukan load ulang saat inferensi.</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-bold hover:bg-gray-700 transition whitespace-nowrap flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Clear Cache
            </button>
          </div>

          <div className="p-5 rounded-xl bg-accent-rose/5 border border-accent-rose/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-accent-rose mb-1">Reset Database (Wipe)</p>
              <p className="text-xs text-accent-rose/70">Hapus SELURUH data historis dari database SQLite. Tindakan tidak dapat dibatalkan!</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-accent-rose text-white text-sm font-bold hover:bg-red-600 transition whitespace-nowrap flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Factory Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
