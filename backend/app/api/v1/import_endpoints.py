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
