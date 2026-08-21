"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings,
  Shield,
  Smartphone,
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AppSettings() {
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [minAiScore, setMinAiScore] = useState(75);
  const [takeProfit, setTakeProfit] = useState(8);
  const [stopLoss, setStopLoss] = useState(-4);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load settings from LocalStorage
  useEffect(() => {
    const token = localStorage.getItem("sinyalai_settings_tg_token") || "123456789:ABCdefGHIjklmNOPqrsTUVwxyz";
    const chat = localStorage.getItem("sinyalai_settings_tg_chat") || "-1001234567890";
    const wa = localStorage.getItem("sinyalai_settings_wa_url") || "";
    const score = parseInt(localStorage.getItem("sinyalai_settings_min_score") || "75");
    const tp = parseInt(localStorage.getItem("sinyalai_settings_tp") || "8");
    const sl = parseInt(localStorage.getItem("sinyalai_settings_sl") || "-4");

    setTelegramToken(token);
    setTelegramChatId(chat);
    setWhatsappUrl(wa);
    setMinAiScore(score);
    setTakeProfit(tp);
    setStopLoss(sl);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("sinyalai_settings_tg_token", telegramToken);
    localStorage.setItem("sinyalai_settings_tg_chat", telegramChatId);
    localStorage.setItem("sinyalai_settings_wa_url", whatsappUrl);
    localStorage.setItem("sinyalai_settings_min_score", minAiScore.toString());
    localStorage.setItem("sinyalai_settings_tp", takeProfit.toString());
    localStorage.setItem("sinyalai_settings_sl", stopLoss.toString());

    // Show success message
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-400" />
            Platform Settings
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Konfigurasi bot notifikasi, preferensi antarmuka, dan parameter AI default.
          </p>
        </div>
        
        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs font-semibold animate-pulse">
            <CheckCircle className="w-4 h-4" />
            Configurations Saved!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Integrations */}
        <div className="glass-card rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-accent-cyan" />
            Notification Bots
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Telegram Bot API Token</label>
              <input 
                type="password" 
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Telegram Chat ID</label>
              <input 
                type="text" 
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">WhatsApp API URL (Optional)</label>
              <input 
                type="text" 
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                placeholder="https://api.whatsapp.com/send?phone=..." 
                className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* Trading Parameters */}
        <div className="glass-card rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-purple" />
            Risk & AI Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Default AI Minimum Score</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={minAiScore}
                  onChange={(e) => setMinAiScore(parseInt(e.target.value) || 0)}
                  className="w-full accent-accent-purple cursor-pointer" 
                />
                <span className="font-bold text-white w-8 text-right">{minAiScore}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Default Take Profit (%)</label>
                <input 
                  type="number" 
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-purple transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Default Stop Loss (%)</label>
                <input 
                  type="number" 
                  value={stopLoss}
                  onChange={(e) => setStopLoss(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-purple transition-colors" 
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit"
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-accent-cyan hover:bg-accent-cyan/80 text-black text-sm font-bold transition shadow-lg shadow-accent-cyan/25"
        >
          <Save className="w-4 h-4" />
          Save Configurations
        </button>
      </div>
    </form>
  );
}
