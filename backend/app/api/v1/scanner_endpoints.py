from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import Stock, ScannerResult, DailyPrice, TechnicalIndicator, Financial, ForeignFlow
from datetime import date
from typing import List, Dict, Any

router = APIRouter(
    prefix="/scanner",
    tags=["Stock Scanner Engine"]
)

@router.get("/", status_code=status.HTTP_200_OK)
def get_latest_scanner_results(db: Session = Depends(get_db)):
    """
    Mengambil data hasil screening AI terbaru untuk seluruh emiten aktif di bursa.
    """
    try:
        # Cari tanggal screening terbaru di database
        latest_date = db.query(func.max(ScannerResult.date)).scalar()
        if not latest_date:
            return []

        # Ambil hasil screening untuk tanggal terbaru
        results = db.query(ScannerResult, Stock).join(
            Stock, ScannerResult.stock_id == Stock.id
        ).filter(
            ScannerResult.date == latest_date,
            Stock.is_active == True
        ).all()

        output = []
        for res, stock in results:
            # Ambil data finansial terbaru
            fin = db.query(Financial).filter(
                Financial.stock_id == stock.id
            ).order_by(Financial.year.desc(), Financial.quarter.desc()).first()

            # Ambil data harga harian terbaru
            price = db.query(DailyPrice).filter(
                DailyPrice.stock_id == stock.id,
                DailyPrice.date == latest_date
            ).first()
            if not price:
                price = db.query(DailyPrice).filter(
                    DailyPrice.stock_id == stock.id
                ).order_by(DailyPrice.date.desc()).first()

            output.append({
                "ticker": stock.ticker,
                "name": stock.name,
                "sector": stock.sector,
                "sub_sector": stock.sub_sector,
                "close": float(price.close) if price else 0.0,
                "volume": int(price.volume) if price else 0,
                "market_cap": stock.market_cap,
                "ai_score": res.ai_score,
                "recommendation": res.recommendation,
                "target_price": float(res.target_price) if res.target_price else None,
                "stop_loss": float(res.stop_loss) if res.stop_loss else None,
                "expected_return": float(res.expected_return) if res.expected_return else 0.0,
                "risk_reward_ratio": float(res.risk_reward_ratio) if res.risk_reward_ratio else 0.0,
                "conditions_passed": res.conditions_passed,
                "roe": float(fin.roe) if (fin and fin.roe) else 0.0,
                "per": float(fin.per) if (fin and fin.per) else 0.0,
                "pbv": float(fin.pbv) if (fin and fin.pbv) else 0.0,
                "der": float(fin.der) if (fin and fin.der) else 0.0,
                "date": str(res.date)
            })

        return output
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil hasil scanner: {str(e)}"
        )

@router.get("/divergences", status_code=status.HTTP_200_OK)
def get_latest_divergences(db: Session = Depends(get_db)):
    """
    Mengambil data seluruh emiten yang terdeteksi memiliki Bullish / Bearish Divergence (Regular/Hidden).
    """
    try:
        # Cari tanggal screening terbaru
        latest_date = db.query(func.max(ScannerResult.date)).scalar()
        if not latest_date:
            return []

        # Ambil hasil screening yang memiliki data divergensi
        results = db.query(ScannerResult, Stock).join(
            Stock, ScannerResult.stock_id == Stock.id
        ).filter(
            ScannerResult.date == latest_date,
            Stock.is_active == True
        ).all()

        output = []
        for res, stock in results:
            conds = res.conditions_passed or {}
            divergences = conds.get("divergences", [])
            
            if divergences:
                # Ambil data harga close saat ini
                price = db.query(DailyPrice).filter(
                    DailyPrice.stock_id == stock.id,
                    DailyPrice.date == latest_date
                ).first()
                if not price:
                    price = db.query(DailyPrice).filter(
                        DailyPrice.stock_id == stock.id
                    ).order_by(DailyPrice.date.desc()).first()

                for div in divergences:
                    output.append({
                        "ticker": stock.ticker,
                        "name": stock.name,
                        "close": float(price.close) if price else 0.0,
                        "type": div.get("type"),
                        "indicator": div.get("indicator", "").upper(),
                        "confidence_score": div.get("confidence_score", 50.0),
                        "explanation": div.get("explanation", ""),
                        "date": str(res.date)
                    })

        return output
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil hasil divergensi: {str(e)}"
        )
