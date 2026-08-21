from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.import_engine import DataImportEngine
from app.services.indicator_engine import TechnicalIndicatorEngine
from app.services.divergence_engine import DivergenceDetectionEngine
from app.db.models import Stock

router = APIRouter(
    prefix="/import",
    tags=["Import Engine"]
)

@router.post("/sync-stocks", status_code=status.HTTP_200_OK)
def sync_stocks(db: Session = Depends(get_db)):
    """Menyelaraskan daftar emiten/stocks di database dengan data terbaru dari IDX."""
    try:
        engine = DataImportEngine(db)
        engine.sync_stocks_list()
        return {"status": "success", "message": "Stocks list synchronization triggered successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menyelaraskan daftar saham: {str(e)}"
        )

@router.post("/sync-prices", status_code=status.HTTP_200_OK)
def sync_prices(ticker: str = None, force_full: bool = False, db: Session = Depends(get_db)):
    """
    Menyelaraskan data harga harian.
    Jika parameter `ticker` diberikan, hanya saham tersebut yang diselaraskan.
    Jika tidak, maka seluruh saham yang aktif di database akan diselaraskan.
    """
    try:
        engine = DataImportEngine(db)
        indicator_engine = TechnicalIndicatorEngine(db)
        divergence_engine = DivergenceDetectionEngine(db)
        
        if ticker:
            ticker_upper = ticker.upper()
            engine.sync_daily_prices(ticker_upper, force_full=force_full)
            engine.sync_foreign_flow(ticker_upper)
            engine.sync_financial_statements(ticker_upper)
            # Hitung indikator teknikal
            indicator_engine.sync_stock_indicators(ticker_upper, force_recalculate=force_full)
            # Deteksi divergensi
            divergence_engine.detect_and_store_all_divergences(ticker_upper)
        else:
            # Sync semua saham aktif
            stocks = db.query(Stock).filter(Stock.is_active == True).all()
            for stock in stocks:
                try:
                    engine.sync_daily_prices(stock.ticker, force_full=force_full)
                    engine.sync_foreign_flow(stock.ticker)
                    engine.sync_financial_statements(stock.ticker)
                    # Hitung indikator teknikal
                    indicator_engine.sync_stock_indicators(stock.ticker, force_recalculate=force_full)
                    # Deteksi divergensi
                    divergence_engine.detect_and_store_all_divergences(stock.ticker)
                except Exception as sub_e:
                    # Log kesalahan spesifik saham ini, tapi lanjut ke saham berikutnya
                    engine.log_to_system("ERROR", "sync_prices_bulk", f"Gagal untuk {stock.ticker}: {str(sub_e)}")
                    continue
            
            # Jalankan AI screening & scoring harian
            from app.services.screening_engine import AIScreeningEngine
            from datetime import date
            screening_engine = AIScreeningEngine(db)
            screening_engine.run_screening_and_scoring(date.today())
            
        return {"status": "success", "message": "Daily prices, indicators, divergence detection, and AI screening completed"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menyelaraskan data harga harian, indikator, divergensi, & screening: {str(e)}"
        )

@router.post("/add-ticker", status_code=status.HTTP_201_CREATED)
def add_ticker(ticker: str, name: str = None, sector: str = None, sub_sector: str = None, db: Session = Depends(get_db)):
    """
    Menambahkan emiten baru secara manual ke pemantauan dan langsung menyinkronkan datanya.
    """
    try:
        from datetime import date
        ticker_upper = ticker.upper().strip()
        existing = db.query(Stock).filter(Stock.ticker == ticker_upper).first()
        if existing:
            return {"status": "info", "message": f"Emiten {ticker_upper} sudah ada di database."}
            
        new_stock = Stock(
            ticker=ticker_upper,
            name=name if name else f"{ticker_upper} Tbk.",
            sector=sector if sector else "Unknown",
            sub_sector=sub_sector if sub_sector else "Unknown",
            is_active=True
        )
        db.add(new_stock)
        db.commit()
        db.refresh(new_stock)
        
        # Pemicu sinkronisasi data awal
        engine = DataImportEngine(db)
        indicator_engine = TechnicalIndicatorEngine(db)
        divergence_engine = DivergenceDetectionEngine(db)
        
        engine.sync_daily_prices(ticker_upper, force_full=True)
        engine.sync_foreign_flow(ticker_upper)
        engine.sync_financial_statements(ticker_upper)
        
        # Hitung indikator teknikal & divergence
        indicator_engine.sync_stock_indicators(ticker_upper, force_recalculate=True)
        divergence_engine.detect_and_store_all_divergences(ticker_upper)
        
        # Jalankan screening AI
        from app.services.screening_engine import AIScreeningEngine
        screening_engine = AIScreeningEngine(db)
        screening_engine.run_screening_and_scoring(date.today())
        
        return {"status": "success", "message": f"Emiten {ticker_upper} berhasil ditambahkan dan dianalisis."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menambahkan emiten: {str(e)}"
        )

@router.get("/status", status_code=status.HTTP_200_OK)
def get_import_status(db: Session = Depends(get_db)):
    """
    Mengecek status kesehatan koneksi Yahoo Finance API berdasarkan log kesalahan terbaru.
    """
    try:
        from datetime import datetime, timedelta
        from app.db.models import SystemLog
        
        # Cari log error terbaru terkait sync fundamental/harga dalam 3 hari terakhir
        three_days_ago = datetime.utcnow() - timedelta(days=3)
        error_log = db.query(SystemLog).filter(
            SystemLog.level == "ERROR",
            SystemLog.module.in_(["sync_financial_statements", "sync_daily_prices", "fetch_yahoo_finance_fundamentals"]),
            SystemLog.created_at >= three_days_ago
        ).order_by(SystemLog.created_at.desc()).first()
        
        if error_log:
            return {
                "status": "warning",
                "message": f"Yahoo Finance API terblokir pada {error_log.created_at.strftime('%Y-%m-%d %H:%M')}: {error_log.message}. Sistem saat ini menggunakan fallback database lokal. Silakan hubungi developer untuk pembaruan koding bypass!",
                "timestamp": str(error_log.created_at)
            }
            
        return {
            "status": "ok",
            "message": "Koneksi API Yahoo Finance berjalan dengan normal (100% Live)."
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Gagal mengecek status kesehatan API: {str(e)}"
        }
