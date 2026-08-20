from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.ai_analysis import AIAnalysisService

router = APIRouter(
    prefix="/analysis",
    tags=["AI Analysis Engine"]
)

@router.get("/{ticker}", status_code=status.HTTP_200_OK)
def get_ai_stock_analysis(ticker: str, db: Session = Depends(get_db)):
    """
    Menghasilkan laporan analisis saham mendalam (Markdown) berbasis AI untuk emiten tertentu.
    Laporan mencakup Business Summary, Technical, Fundamental, Valuasi (DCF, PER, PBV), dsb.
    """
    try:
        service = AIAnalysisService(db)
        report = service.generate_ai_report(ticker.upper())
        return {
            "ticker": ticker.upper(),
            "status": "success",
            "report_markdown": report
        }
    except ValueError as val_e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menghasilkan laporan analisis AI: {str(e)}"
        )
