"use client";

import React, { useState, useEffect } from "react";
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
  Trash2,
  X,
  Loader2
} from "lucide-react";

export default function Alerts() {
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [marketStocks, setMarketStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formTicker, setFormTicker] = useState("");
  const [formCondition, setFormCondition] = useState("PRICE_ABOVE");
  const [formValue, setFormValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const userId = "admin_quant";

  const fetchAlertsAndLogs = async () => {
    try {
      setLoading(true);
      
      // Ambil alarm aktif
      const activeRes = await fetch(`/api/v1/alerts/active/${userId}`);
      const activeData = activeRes.ok ? await activeRes.json() : [];
      setActiveAlerts(activeData);

      // Ambil riwayat alarm terpicu
      const historyRes = await fetch(`/api/v1/alerts/history/${userId}`);
      const historyData = historyRes.ok ? await historyRes.json() : [];
      setHistoryLogs(historyData);

      // Ambil emiten pasar untuk validasi form
      const marketRes = await fetch("/api/v1/scanner");
      const marketData = marketRes.ok ? await marketRes.json() : [];
      setMarketStocks(marketData);

    } catch (err) {
      console.error("Error fetching alert data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsAndLogs();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanTicker = formTicker.trim().toUpperCase();
    if (!cleanTicker) return;

    // Validasi ticker
    const stockExists = marketStocks.some(s => s.ticker === cleanTicker);
    if (!stockExists) {
      setErrorMsg(`Saham ${cleanTicker} tidak ditemukan di database.`);
      return;
    }

    const valueNum = parseFloat(formValue);
    if (formCondition.startsWith("PRICE") && (isNaN(valueNum) || valueNum <= 0)) {
      setErrorMsg("Masukkan nilai harga threshold yang valid.");
      return;
    }

    try {
      const res = await fetch("/api/v1/alerts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: userId,
          ticker: cleanTicker,
          condition_type: formCondition,
          threshold_value: isNaN(valueNum) ? null : valueNum
        })
      });

      if (res.ok) {
        setShowModal(false);
        setFormTicker("");
        setFormValue("");
        setFormCondition("PRICE_ABOVE");
        fetchAlertsAndLogs(); // Reload data
      } else {
        const errData = await res.json();
        setErrorMsg(errData.detail || "Gagal membuat alert baru.");
      }
    } catch (err) {
      console.error("Error posting alert:", err);
      setErrorMsg("Koneksi ke backend gagal.");
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      const res = await fetch(`/api/v1/alerts/${alertId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        // Hapus dari state
        setActiveAlerts(activeAlerts.filter(a => a.id !== alertId));
      }
    } catch (err) {
      console.error("Gagal menghapus alert:", err);
    }
  };

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
        
        <button 
          onClick={() => { setShowModal(true); setErrorMsg(""); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-amber hover:bg-accent-amber/80 text-black text-sm font-bold transition shadow-lg shadow-accent-amber/25"
        >
          <Plus className="w-4 h-4" />
          Create New Alert
        </button>
      </div>

      {/* Integration Channels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-accent-cyan/50 transition">
           <Send className="w-8 h-8 text-[#0088cc] mb-2" />
           <p className="font-bold text-white text-sm">Telegram</p>
           <p className="text-xs text-accent-emerald mt-1 font-semibold">Connected</p>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-accent-cyan/50 transition border-accent-emerald/30">
           <MessageCircle className="w-8 h-8 text-[#25D366] mb-2" />
           <p className="font-bold text-white text-sm">WhatsApp</p>
           <p className="text-xs text-accent-emerald mt-1 font-semibold">Connected</p>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center opacity-40">
           <Mail className="w-8 h-8 text-gray-500 mb-2" />
           <p className="font-bold text-white text-sm">Email</p>
           <p className="text-xs text-gray-500 mt-1">Disconnected</p>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center opacity-40">
           <Bell className="w-8 h-8 text-gray-500 mb-2" />
           <p className="font-bold text-white text-sm">Browser Push</p>
           <p className="text-xs text-gray-500 mt-1">Disconnected</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
          <span>Memuat data notifikasi...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Alerts Table (Span 2) */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Active Triggers</h3>
            </div>
            
            <div className="overflow-x-auto">
              {activeAlerts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Belum ada alarm aktif. Silakan tambahkan trigger baru.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs text-gray-400 uppercase font-medium">
                      <th className="py-4 px-4">Ticker</th>
                      <th className="py-4 px-4">Condition Type</th>
                      <th className="py-4 px-4">Threshold</th>
                      <th className="py-4 px-4">Channel</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {activeAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-white/5 transition-colors duration-150">
                        <td className="py-4 px-4 font-bold text-white">{alert.ticker}</td>
                        <td className="py-4 px-4">
                          <span className="flex items-center gap-1.5 text-gray-300 text-xs font-semibold">
                            {alert.condition_type === "PRICE_BELOW" && <TrendingDown className="w-3.5 h-3.5 text-accent-rose" />}
                            {alert.condition_type === "PRICE_ABOVE" && <TrendingUp className="w-3.5 h-3.5 text-accent-emerald" />}
                            {alert.condition_type === "DIVERGENCE" && <Activity className="w-3.5 h-3.5 text-accent-cyan" />}
                            {alert.condition_type === "VOLUME_BREAKOUT" && <TrendingUp className="w-3.5 h-3.5 text-accent-purple" />}
                            {alert.condition_type === "GOLDEN_CROSS" && <TrendingUp className="w-3.5 h-3.5 text-accent-amber" />}
                            {alert.condition_type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-xs font-medium">
                          {alert.threshold_value ? `Rp ${alert.threshold_value.toLocaleString('id-ID')}` : "-"}
                        </td>
                        <td className="py-4 px-4 text-gray-300 text-xs">Telegram, WA</td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20">
                            Active
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="p-2 text-gray-500 hover:text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors"
                            title="Hapus Trigger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* History Sidebar */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Recent History</h3>
            <div className="relative border-l-2 border-gray-800 ml-3 space-y-8 h-[360px] overflow-y-auto pr-2">
              {historyLogs.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">Belum ada alarm yang pernah terpicu.</p>
              ) : (
                historyLogs.map((item) => (
                  <div key={item.log_id} className="relative pl-6">
                    <div className={"absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-[#090a0f] " + (
                      item.status === 'ERROR' ? 'bg-accent-rose' : 'bg-accent-emerald'
                    )}></div>
                    <p className="text-[10px] text-gray-500 mb-1">{new Date(item.triggered_at).toLocaleString('id-ID')}</p>
                    <p className="text-xs text-gray-300 bg-gray-800/30 p-3 rounded-lg border border-border/50 leading-relaxed font-medium">
                      {item.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 relative border border-border">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-white mb-2">Create Trigger Alert</h3>
            <p className="text-xs text-gray-400 mb-6">
              Buat notifikasi instan jika saham menembus kondisi harga atau indikator teknikal tertentu.
            </p>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Ticker Saham</label>
                <input 
                  type="text" 
                  placeholder="Contoh: BBRI, ADRO, GOTO" 
                  value={formTicker}
                  onChange={(e) => setFormTicker(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                  maxLength={4}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Condition Type</label>
                <select 
                  value={formCondition}
                  onChange={(e) => setFormCondition(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-gray-300 text-sm focus:outline-none focus:border-accent-cyan appearance-none cursor-pointer"
                >
                  <option value="PRICE_ABOVE">Price Above (Menembus Atas)</option>
                  <option value="PRICE_BELOW">Price Below (Menembus Bawah)</option>
                  <option value="DIVERGENCE">Divergence Detected (Divergensi)</option>
                  <option value="VOLUME_BREAKOUT">Volume Breakout &gt; 200%</option>
                  <option value="GOLDEN_CROSS">Golden Cross (MA50 &gt; MA200)</option>
                </select>
              </div>

              {formCondition.startsWith("PRICE") && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Price Threshold (Rp)</label>
                  <input 
                    type="number" 
                    placeholder="Contoh: 10250" 
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                    required
                  />
                </div>
              )}

              {errorMsg && (
                <p className="text-xs text-accent-rose font-medium bg-accent-rose/10 border border-accent-rose/20 p-2.5 rounded-xl">
                  {errorMsg}
                </p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-gray-400 hover:text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-accent-cyan hover:bg-accent-cyan/80 text-black text-xs font-bold transition shadow-lg shadow-accent-cyan/25"
                >
                  Buat Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
