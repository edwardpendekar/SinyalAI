from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from datetime import date
from pydantic import BaseModel, Field
from app.db.session import get_db
from app.services.backtest_engine import BacktestEngine

router = APIRouter(
    prefix="/backtest",
    tags=["Backtest Engine"]
)

class BacktestRequest(BaseModel):
    ticker: str
    start_date: date
    end_date: date
    min_ai_score: int = Field(70, ge=0, le=100, description="Minimum AI Score to enter buy position")

@router.post("/", status_code=status.HTTP_200_OK)
def run_stock_backtest(req: BacktestRequest, db: Session = Depends(get_db)):
    """
    Menjalankan pengujian historis (backtest) strategi Sinyal Saham AI harian untuk emiten bursa tertentu.
    Mengembalikan data metrik portofolio, simulasi Monte Carlo, log transaksi, dan laporan markdown.
    """
    try:
        engine = BacktestEngine(db)
        result = engine.run_backtest_strategy(
            ticker=req.ticker.upper(),
            start_date=req.start_date,
            end_date=req.end_date,
            min_ai_score=req.min_ai_score
        )
        
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
            
        report_md = engine.generate_backtest_report_markdown(result)
        
        return {
            "status": "success",
            "data": result,
            "report_markdown": report_md
        }
    except ValueError as val_e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memproses backtesting: {str(e)}"
        )
