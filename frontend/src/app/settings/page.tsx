import { 
  Settings,
  BellRing,
  Shield,
  Smartphone,
  Save,
  Database
} from "lucide-react";

export default function AppSettings() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-400" />
          Platform Settings
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Konfigurasi bot notifikasi, preferensi antarmuka, dan parameter AI default.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Integrations */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-accent-cyan" />
            Notification Bots
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Telegram Bot API Token</label>
              <input type="password" defaultValue="123456789:ABCdefGHIjklmNOPqrsTUVwxyz" className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-gray-400 text-sm focus:outline-none focus:border-accent-cyan transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Telegram Chat ID</label>
              <input type="text" defaultValue="-1001234567890" className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">WhatsApp API URL (Optional)</label>
              <input type="text" placeholder="https://api.whatsapp.com/send?phone=..." className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors" />
            </div>
          </div>
        </div>

        {/* Trading Parameters */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-purple" />
            Risk & AI Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Default AI Minimum Score</label>
              <div className="flex items-center gap-4">
                <input type="range" min="0" max="100" defaultValue="75" className="w-full accent-accent-purple" />
                <span className="font-bold text-white">75</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Default Take Profit (%)</label>
                <input type="number" defaultValue="8" className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-purple transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Default Stop Loss (%)</label>
                <input type="number" defaultValue="-4" className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-purple transition-colors" />
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-4">
        <button className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-accent-cyan hover:bg-accent-cyan/80 text-black text-sm font-bold transition shadow-lg shadow-accent-cyan/25">
          <Save className="w-4 h-4" />
          Save Configurations
        </button>
      </div>
    </div>
  );
}
