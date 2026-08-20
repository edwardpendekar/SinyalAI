"use client";

import React, { useState } from "react";
import { 
  ShieldAlert,
  Database,
  RefreshCw,
  Server,
  Activity,
  Trash2,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";

export default function Admin() {
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [subSector, setSubSector] = useState("");
  
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const triggerAction = async (actionName: string, url: string, method: string = "POST") => {
    setLoading(actionName);
    setMessage(null);
    try {
      const res = await fetch(url, { method });
      const data = await res.json();
      if (res.ok) {
        setMessage({ 
          type: "success", 
          text: data.message || `Aksi ${actionName} berhasil dieksekusi.` 
        });
      } else {
        setMessage({ 
          type: "error", 
          text: data.detail || `Gagal mengeksekusi ${actionName}.` 
        });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: `Error koneksi: ${err.message}` });
    } finally {
      setLoading(null);
    }
  };

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;
    
    setLoading("add-ticker");
    setMessage(null);
    try {
      const params = new URLSearchParams();
      params.append("ticker", ticker);
      if (name) params.append("name", name);
      if (sector) params.append("sector", sector);
      if (subSector) params.append("sub_sector", subSector);

      const res = await fetch(`/api/v1/import/add-ticker?${params.toString()}`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ 
          type: data.status === "info" ? "success" : "success", 
          text: data.message 
        });
        setTicker("");
        setName("");
        setSector("");
        setSubSector("");
      } else {
        setMessage({ 
          type: "error", 
          text: data.detail || "Gagal menambahkan emiten." 
        });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: `Error: ${err.message}` });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-accent-rose" />
          System Administration
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Kontrol server backend, tambahkan emiten kustom, dan lakukan sinkronisasi data secara langsung.
        </p>
      </div>

      {/* Alert Notification Box */}
      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          message.type === "success" 
            ? "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald"
            : "bg-accent-rose/10 border-accent-rose/30 text-accent-rose"
        }`}>
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="text-sm font-semibold">{message.type === "success" ? "Sukses" : "Gagal"}</p>
            <p className="text-xs opacity-90 mt-0.5">{message.text}</p>
          </div>
        </div>
      )}

      {/* Ticker Management / Add Custom Stock */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-accent-cyan" />
          Tambah Emiten Pantauan Baru (Custom Ticker)
        </h3>
        <p className="text-gray-400 text-xs mb-6">
          Masukkan kode emiten yang belum ada di database (misal: BREN, AMMN, CUAN). Sistem akan otomatis mengunduh harga historis Yahoo Finance, menghitung indikator teknikal &amp; divergence, serta memicu AI screening seketika.
        </p>

        <form onSubmit={handleAddTicker} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 font-medium">Ticker Code (Wajib)</label>
            <input 
              type="text" 
              placeholder="e.g. BREN" 
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan/50"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 font-medium">Nama Emiten (Opsional)</label>
            <input 
              type="text" 
              placeholder="e.g. Barito Renewables Energy Tbk." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan/50"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 font-medium">Sektor (Opsional)</label>
            <input 
              type="text" 
              placeholder="e.g. Infrastructure" 
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan/50"
            />
          </div>
          <div className="flex flex-col justify-end">
            <button 
              type="submit"
              disabled={loading === "add-ticker"}
              className="w-full px-4 py-2.5 rounded-xl bg-accent-cyan hover:bg-[#06b6d4] text-black text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading === "add-ticker" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Tambah &amp; Analisis
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* System Health */}
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
                <p className="text-xs text-gray-500">FastAPI on port 8000</p>
             </div>
           </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-t-2 border-t-[#3b82f6]">
           <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
             <Database className="w-4 h-4" />
             Database Status
           </h3>
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-[#3b82f6]" />
             </div>
             <div>
                <p className="text-xl font-bold text-white">Active</p>
                <p className="text-xs text-gray-500">PostgreSQL Database</p>
             </div>
           </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-t-2 border-t-accent-amber">
           <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
             <Activity className="w-4 h-4" />
             Data Scanner Engine
           </h3>
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-accent-amber/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent-amber" />
             </div>
             <div>
                <p className="text-xl font-bold text-white">Active</p>
                <p className="text-xs text-gray-500">Auto Technical &amp; AI Analysis</p>
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
              <p className="font-bold text-white mb-1">Refresh Prices (Incremental Sync)</p>
              <p className="text-xs text-gray-500">Tarik data harga saham terbaru untuk mengisi kekosongan harga hari ini (Fast).</p>
            </div>
            <button 
              onClick={() => triggerAction("Incremental Sync", "/api/v1/import/sync-prices", "POST")}
              disabled={loading !== null}
              className="px-4 py-2 rounded-lg bg-[#3b82f6]/20 text-[#3b82f6] text-sm font-bold hover:bg-[#3b82f6] hover:text-white transition whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
            >
              {loading === "Incremental Sync" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Execute
            </button>
          </div>

          <div className="p-5 rounded-xl bg-black/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-white mb-1">Force Recalculate AI Score (Full Sync)</p>
              <p className="text-xs text-gray-500">Tarik ulang seluruh data 1 tahun ke belakang untuk semua emiten dan kalkulasi ulang AI Score.</p>
            </div>
            <button 
              onClick={() => triggerAction("Full Sync", "/api/v1/import/sync-prices?force_full=true", "POST")}
              disabled={loading !== null}
              className="px-4 py-2 rounded-lg bg-accent-purple/20 text-accent-purple text-sm font-bold hover:bg-accent-purple hover:text-white transition whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
            >
              {loading === "Full Sync" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Execute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
