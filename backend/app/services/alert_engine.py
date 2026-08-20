import os
import logging
import urllib.request
import json
from datetime import date
from sqlalchemy.orm import Session
from app.db.models import Alert, AlertLog, DailyPrice, TechnicalIndicator, ScannerResult, Stock, Setting

logger = logging.getLogger("AlertEngine")
logger.setLevel(logging.INFO)

class AlertEngine:
    def __init__(self, db: Session):
        self.db = db
        # Config tokens from env
        self.telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "MOCK_TOKEN")
        self.whatsapp_api_url = os.getenv("WHATSAPP_API_URL", "https://api.whatsapp.mock")
        self.whatsapp_token = os.getenv("WHATSAPP_TOKEN", "MOCK_WA_TOKEN")

    def log_alert_trigger(self, alert_id: int, message: str, status: str = "SENT"):
        """Mencatat histori pemicuan alarm ke tabel alert_logs."""
        try:
            log_entry = AlertLog(
                alert_id=alert_id,
                message=message,
                status=status
            )
            self.db.add(log_entry)
            self.db.commit()
        except Exception as e:
            logger.error(f"Gagal mencatat alert log: {str(e)}")

    def send_telegram(self, chat_id: str, message: str) -> bool:
        """Mengirim pesan alarm ke bot Telegram menggunakan HTTP urllib."""
        if not chat_id or self.telegram_bot_token == "MOCK_TOKEN":
            logger.info(f"[Mock Telegram] Mengirim ke {chat_id}: {message}")
            return True
        
        url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "HTML"
        }
        try:
            req = urllib.request.Request(
                url, 
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                res = json.loads(response.read().decode("utf-8"))
                return res.get("ok", False)
        except Exception as e:
            logger.error(f"Gagal mengirim Telegram: {str(e)}")
            return False

    def send_whatsapp(self, number: str, message: str) -> bool:
        """Mengirim pesan alarm ke WhatsApp menggunakan HTTP API Gateway (Simulasi/MOCK)."""
        logger.info(f"[Mock WhatsApp] Mengirim ke {number}: {message}")
        # Di bursa produksi, integrasikan dengan penyedia layanan WA Gateway (misal: Twilio, Waba, Fonnte, dll)
        return True

    def send_email(self, email_address: str, subject: str, message: str) -> bool:
        """Mengirim pesan alarm ke Email (Simulasi/MOCK)."""
        logger.info(f"[Mock Email] Mengirim ke {email_address} (Subj: {subject}): {message}")
        return True

    def evaluate_and_trigger_alerts(self, target_date: date = None):
        """
        Pindai semua alert pengguna yang aktif dan picu notifikasi 
        jika kondisi teknikal/harga terpenuhi pada target_date.
        """
        if not target_date:
            target_date = date.today()

        logger.info(f"AlertEngine: Memulai evaluasi alarm untuk tanggal {target_date}...")
        
        # Ambil semua alert aktif
        active_alerts = self.db.query(Alert).filter(Alert.is_active == True).all()

        for alert in active_alerts:
            user = alert.user
            stock = alert.stock
            
            # Ambil setting notifikasi user
            settings = self.db.query(Setting).filter(Setting.user_id == user.id).first()
            if not settings or not settings.alert_enabled:
                continue

            try:
                # Ambil data harga hari ini
                price = self.db.query(DailyPrice).filter(
                    DailyPrice.stock_id == stock.id,
                    DailyPrice.date == target_date
                ).first()
                
                if not price:
                    continue

                close_price = float(price.close)
                high_price = float(price.high)
                low_price = float(price.low)
                volume = price.volume

                # Ambil indikator teknikal hari ini
                ti = self.db.query(TechnicalIndicator).filter(
                    TechnicalIndicator.stock_id == stock.id,
                    TechnicalIndicator.date == target_date
                ).first()

                # Ambil hasil scanner hari ini (untuk divergence & Golden Cross)
                scan = self.db.query(ScannerResult).filter(
                    ScannerResult.stock_id == stock.id,
                    ScannerResult.date == target_date
                ).first()

                should_trigger = False
                trigger_msg = ""

                # --- Evaluasi Kondisi Trigger ---
                cond = alert.condition_type.upper()

                if cond == "PRICE_ABOVE" and alert.threshold_value:
                    threshold = float(alert.threshold_value)
                    if close_price >= threshold:
                        should_trigger = True
                        trigger_msg = f"🔔 <b>Alert Harga ABOVE</b>: {stock.ticker} telah menembus ke atas target harga Rp {threshold:,.0f}. Harga saat ini Rp {close_price:,.0f}."

                elif cond == "PRICE_BELOW" and alert.threshold_value:
                    threshold = float(alert.threshold_value)
                    if close_price <= threshold:
                        should_trigger = True
                        trigger_msg = f"⚠️ <b>Alert Harga BELOW</b>: {stock.ticker} telah menembus ke bawah batas Rp {threshold:,.0f}. Harga saat ini Rp {close_price:,.0f}."

                elif cond == "GOLDEN_CROSS":
                    if scan and "MA50 > MA200 (Golden Cross)" in scan.conditions_passed.get("conditions_passed", []):
                        should_trigger = True
                        trigger_msg = f"🚀 <b>Golden Cross MA50/200</b>: Saham {stock.ticker} membentuk sinyal bullish uptrend (Golden Cross) hari ini."

                elif cond == "HIDDEN_BULLISH":
                    if scan and "divergences" in scan.conditions_passed:
                        has_hb = any(div["type"] == "Hidden Bullish" for div in scan.conditions_passed["divergences"])
                        if has_hb:
                            should_trigger = True
                            trigger_msg = f"📈 <b>Hidden Bullish Divergence</b>: Terdeteksi sinyal kelanjutan tren bullish (Hidden Bullish) pada indikator {stock.ticker} hari ini."

                elif cond == "VOLUME_BREAKOUT":
                    if scan and any("Relative Volume > 1.2" in c for c in scan.conditions_passed.get("conditions_passed", [])):
                        should_trigger = True
                        trigger_msg = f"🔥 <b>Volume Breakout</b>: Aktivitas transaksi {stock.ticker} mengalami kenaikan volume signifikan (>1.2x rata-rata)."

                elif cond == "TRAILING_STOP" and alert.threshold_value:
                    # Trailing Stop = Menghitung persentase kejatuhan dari harga tertinggi sejak alert aktif
                    # Ambil harga tertinggi sejak alert dibuat menggunakan ORM
                    from sqlalchemy import func
                    peak_result = self.db.query(func.max(DailyPrice.high)).filter(
                        DailyPrice.stock_id == stock.id,
                        DailyPrice.date >= alert.created_at
                    ).scalar()
                    # Simple logic: jika close jatuh di bawah batas trailing stop
                    offset_pct = float(alert.threshold_value) # misal 0.05 untuk 5%
                    peak_price = float(peak_result) if peak_result else float(high_price)
                    stop_level = peak_price * (1 - offset_pct)
                    if close_price <= stop_level:
                        should_trigger = True
                        trigger_msg = f"🛑 <b>Trailing Stop Terpicu</b>: {stock.ticker} jatuh di bawah batas trailing stop Rp {stop_level:,.0f} (Drop >{offset_pct*100:.0f}% dari harga puncak)."

                elif cond == "SUPPORT_RESISTANCE":
                    # Memicu jika harga berada dalam range support / resistance pivot
                    if ti and ti.ichimoku_kijun:
                        kijun_val = float(ti.ichimoku_kijun)
                        # Range 1% dari Kijun (Support dinamis)
                        if abs(close_price - kijun_val) / kijun_val <= 0.01:
                            should_trigger = True
                            trigger_msg = f"🛡️ <b>Dekat Area Support/Kijun</b>: {stock.ticker} mendekati area support dinamis Kijun-sen pada Rp {kijun_val:,.0f}."

                # --- Proses Pengiriman Notifikasi ---
                if should_trigger:
                    success = True
                    
                    # 1. Telegram
                    if settings.telegram_chat_id:
                        tg_ok = self.send_telegram(settings.telegram_chat_id, trigger_msg)
                        success = success and tg_ok
                        
                    # 2. WhatsApp
                    if settings.whatsapp_number:
                        wa_ok = self.send_whatsapp(settings.whatsapp_number, trigger_msg)
                        success = success and wa_ok

                    # Log hasil pemicuan
                    self.log_alert_trigger(
                        alert_id=alert.id,
                        message=trigger_msg,
                        status="SENT" if success else "FAILED"
                    )
                    
                    # Matikan alert setelah terpicu (atau biarkan jika recurring)
                    # Disini kita matikan alert one-shot untuk mencegah spam
                    alert.is_active = False
                    self.db.add(alert)
                    self.db.commit()

            except Exception as e:
                logger.error(f"Gagal memproses alert ID {alert.id}: {str(e)}")
                continue

        logger.info("AlertEngine: Proses evaluasi alarm selesai.")
