from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field
from app.db.session import get_db
from app.db.models import Alert, AlertLog, Stock


router = APIRouter(
    prefix="/alerts",
    tags=["Alert Engine"]
)

class AlertCreate(BaseModel):
    user_id: str
    ticker: str
    condition_type: str = Field(..., description="PRICE_ABOVE, PRICE_BELOW, DIVERGENCE, GOLDEN_CROSS, VOLUME_BREAKOUT")
    threshold_value: float = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user_alert(alert_in: AlertCreate, db: Session = Depends(get_db)):
    """Membuat trigger alarm baru untuk pengguna tertentu."""
    stock = db.query(Stock).filter(Stock.ticker == alert_in.ticker.upper()).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Saham dengan ticker {alert_in.ticker} tidak terdaftar."
        )

    try:
        new_alert = Alert(
            user_id=alert_in.user_id,
            stock_id=stock.id,
            condition_type=alert_in.condition_type.upper(),
            threshold_value=alert_in.threshold_value,
            is_active=True
        )
        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        return {"status": "success", "message": "Alert created successfully", "alert_id": new_alert.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat alert: {str(e)}"
        )

@router.get("/active/{user_id}", status_code=status.HTTP_200_OK)
def get_active_alerts(user_id: str, db: Session = Depends(get_db)):
    """Mengambil seluruh alarm aktif milik pengguna tertentu."""
    alerts = db.query(Alert).filter(
        Alert.user_id == user_id,
        Alert.is_active == True
    ).all()
    
    return [
        {
            "id": a.id,
            "ticker": a.stock.ticker,
            "condition_type": a.condition_type,
            "threshold_value": a.threshold_value,
            "created_at": a.created_at
        }
        for a in alerts
    ]

@router.get("/history/{user_id}", status_code=status.HTTP_200_OK)
def get_alert_history(user_id: str, db: Session = Depends(get_db)):
    """Mengambil riwayat pemicuan alarm (Alert History) untuk pengguna tertentu."""
    logs = db.query(AlertLog).join(Alert).filter(
        Alert.user_id == user_id
    ).order_by(AlertLog.triggered_at.desc()).all()

    return [
        {
            "log_id": log.id,
            "alert_id": log.alert_id,
            "ticker": log.alert.stock.ticker,
            "triggered_at": log.triggered_at,
            "message": log.message,
            "status": log.status
        }
        for log in logs
    ]

@router.delete("/{alert_id}", status_code=status.HTTP_200_OK)
def delete_user_alert(alert_id: int, db: Session = Depends(get_db)):
    """Menonaktifkan alarm pengguna."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert tidak ditemukan."
        )
    try:
        alert.is_active = False
        db.add(alert)
        db.commit()
        return {"status": "success", "message": "Alert deactivated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menonaktifkan alert: {str(e)}"
        )
