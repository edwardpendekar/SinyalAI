import { 
  Bell, 
  Settings, 
  MessageCircle, 
  Send, 
  Mail, 
  Plus, 
  ShieldAlert, 
  TrendingDown, 
  TrendingUp, 
  Activity,
  MoreHorizontal
} from "lucide-react";

export default function Alerts() {
  const activeAlerts = [
    { ticker: "BBCA", condition: "Price falls below Rp 9,800", type: "Stop Loss", channel: "Telegram", status: "Active" },
    { ticker: "GOTO", condition: "Hidden Bearish Divergence", type: "AI Signal", channel: "WhatsApp", status: "Triggered" },
    { ticker: "TLKM", condition: "AI Score drops below 60", type: "Score Change", channel: "Email", status: "Active" },
    { ticker: "ADRO", condition: "Volume Breakout > 200%", type: "Momentum", channel: "Push", status: "Active" }
  ];

  const recentHistory = [
    { time: "Today, 10:45 AM", message: "GOTO Hidden Bearish Divergence terdeteksi di TF 1H.", type: "danger" },
    { time: "Yesterday, 14:20 PM", message: "ADRO menembus resistance 2800 dengan volume tinggi.", type: "success" },
    { time: "18 Aug, 09:15 AM", message: "BBCA mencapai Target Price 1: 10,200. Pertimbangkan Trailing Stop.", type: "info" }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-accent-amber" />
            Alert Engine
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Sistem notifikasi otomatis cerdas untuk memantau momentum, divergence, dan pergerakan harga.
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-amber hover:bg-accent-amber/80 text-black text-sm font-bold transition shadow-lg shadow-accent-amber/25">
          <Plus className="w-4 h-4" />
          Create New Alert
        </button>
      </div>

      {/* Integration Channels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent-cyan/50 transition">
           <Send className="w-8 h-8 text-[#0088cc] mb-2" />
           <p className="font-bold text-white text-sm">Telegram</p>
           <p className="text-xs text-accent-emerald mt-1">Connected</p>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent-cyan/50 transition border-accent-emerald/30">
           <MessageCircle className="w-8 h-8 text-[#25D366] mb-2" />
           <p className="font-bold text-white text-sm">WhatsApp</p>
           <p className="text-xs text-accent-emerald mt-1">Connected</p>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent-cyan/50 transition opacity-50">
           <Mail className="w-8 h-8 text-gray-400 mb-2" />
           <p className="font-bold text-white text-sm">Email</p>
           <p className="text-xs text-gray-500 mt-1">Disconnected</p>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent-cyan/50 transition opacity-50">
           <Bell className="w-8 h-8 text-gray-400 mb-2" />
           <p className="font-bold text-white text-sm">Browser Push</p>
           <p className="text-xs text-gray-500 mt-1">Disconnected</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Alerts Table (Span 2) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Active Triggers</h3>
            <button className="text-gray-400 hover:text-white transition">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                  <th className="py-4 px-4">Ticker</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Condition</th>
                  <th className="py-4 px-4">Channel</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {activeAlerts.map((alert, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors duration-150">
                    <td className="py-4 px-4 font-bold text-white">{alert.ticker}</td>
                    <td className="py-4 px-4">
                      <span className="flex items-center gap-1.5 text-gray-300">
                        {alert.type === 'Stop Loss' && <TrendingDown className="w-3.5 h-3.5 text-accent-rose" />}
                        {alert.type === 'AI Signal' && <Activity className="w-3.5 h-3.5 text-accent-purple" />}
                        {alert.type === 'Score Change' && <ShieldAlert className="w-3.5 h-3.5 text-accent-amber" />}
                        {alert.type === 'Momentum' && <TrendingUp className="w-3.5 h-3.5 text-accent-emerald" />}
                        {alert.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-xs">{alert.condition}</td>
                    <td className="py-4 px-4 text-gray-300">{alert.channel}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider " + (alert.status === 'Active' ? 'text-accent-emerald bg-accent-emerald/10' : 'text-accent-rose bg-accent-rose/10 animate-pulse')}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-gray-500 hover:text-white transition">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Recent History</h3>
          <div className="relative border-l-2 border-gray-800 ml-3 space-y-8">
            {recentHistory.map((item, i) => (
              <div key={i} className="relative pl-6">
                <div className={"absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-[#090a0f] " + (item.type === 'danger' ? 'bg-accent-rose' : item.type === 'success' ? 'bg-accent-emerald' : 'bg-accent-cyan')}></div>
                <p className="text-xs text-gray-500 mb-1">{item.time}</p>
                <p className="text-sm text-gray-300 bg-gray-800/30 p-3 rounded-lg border border-border/50">{item.message}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-center text-xs font-semibold text-gray-400 hover:text-white transition">
            View All History
          </button>
        </div>

      </div>
    </div>
  );
}
