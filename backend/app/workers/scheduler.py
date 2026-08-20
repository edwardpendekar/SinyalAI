import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.db.session import SessionLocal
from app.services.import_engine import DataImportEngine
from app.db.models import Stock
from app.core.config import settings

logger = logging.getLogger("Scheduler")
logger.setLevel(logging.INFO)

scheduler = BackgroundScheduler()

def sync_stocks_and_prices_job():
    """Job terjadwal harian untuk mengunduh data emiten dan harga terbaru."""
    logger.info("Scheduler: Memulai proses singkronisasi data harian...")
    db = SessionLocal()
    try:
        engine = DataImportEngine(db)
        
        # 1. Sync daftar stocks/ticker
        logger.info("Scheduler: Menyelaraskan daftar ticker saham...")
        engine.sync_stocks_list()
        
        # 2. Sync harga dan data asing untuk setiap saham aktif
        stocks = db.query(Stock).filter(Stock.is_active == True).all()
        logger.info(f"Scheduler: Menyelaraskan harga harian untuk {len(stocks)} emiten aktif...")
        for stock in stocks:
            try:
                engine.sync_daily_prices(stock.ticker)
                engine.sync_foreign_flow(stock.ticker)
                engine.sync_financial_statements(stock.ticker)
                
                # Tambahkan kalkulasi indikator teknikal
                from app.services.indicator_engine import TechnicalIndicatorEngine
                indicator_engine = TechnicalIndicatorEngine(db)
                indicator_engine.sync_stock_indicators(stock.ticker)

                # Tambahkan deteksi divergensi
                from app.services.divergence_engine import DivergenceDetectionEngine
                divergence_engine = DivergenceDetectionEngine(db)
                divergence_engine.detect_and_store_all_divergences(stock.ticker)
            except Exception as e:
                logger.error(f"Scheduler: Gagal memproses {stock.ticker}: {str(e)}")
                engine.log_to_system("ERROR", "scheduler_job_item", f"Gagal untuk {stock.ticker}: {str(e)}")
                continue
                
        # 3. Jalankan AI Screening dan Scoring untuk hari ini
        logger.info("Scheduler: Memulai kalkulasi screening dan scoring AI...")
        from app.services.screening_engine import AIScreeningEngine
        from datetime import date
        screening_engine = AIScreeningEngine(db)
        screening_engine.run_screening_and_scoring(date.today())

        # 4. Jalankan Alert Engine untuk memproses notifikasi
        logger.info("Scheduler: Memproses notifikasi alarm...")
        from app.services.alert_engine import AlertEngine
        alert_engine = AlertEngine(db)
        alert_engine.evaluate_and_trigger_alerts(date.today())

        logger.info("Scheduler: Singkronisasi data harian, screening, dan alarm selesai dengan sukses.")
    except Exception as e:
        logger.error(f"Scheduler: Critical error pada scheduler job: {str(e)}")
        # Catat critical error global ke system_logs
        db_log = SessionLocal()
        try:
            engine = DataImportEngine(db_log)
            engine.log_to_system("CRITICAL", "scheduler_job_global", f"Scheduler Job Error: {str(e)}")
        finally:
            db_log.close()
    finally:
        db.close()

def start_scheduler():
    """Memulai scheduler background."""
    if not scheduler.running:
        # Gunakan cron trigger sesuai konfigurasi (.env)
        # Bawaan: Jam 16:30 WIB setiap hari kerja (Senin-Jumat)
        trigger = CronTrigger.from_crontab(settings.IMPORT_SCHEDULER_CRON)
        scheduler.add_job(
            sync_stocks_and_prices_job,
            trigger=trigger,
            id="daily_import_job",
            replace_existing=True
        )
        scheduler.start()
        logger.info(f"Scheduler dimulai dengan cron expression: {settings.IMPORT_SCHEDULER_CRON}")

def shutdown_scheduler():
    """Menghentikan scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler dihentikan.")
