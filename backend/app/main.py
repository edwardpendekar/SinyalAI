import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.import_endpoints import router as import_router
from app.api.v1.analysis_endpoints import router as analysis_router
from app.api.v1.alert_endpoints import router as alert_router
from app.api.v1.backtest_endpoints import router as backtest_router
from app.core.config import settings
from app.db.session import engine, Base

# Setup root logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API untuk AI Stock Scanner BEI (Sinyal Saham AI)",
    version="1.0.0"
)

# Setup CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Di produksi, batasi ke domain frontend tertentu
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(import_router, prefix="/api/v1")
app.include_router(analysis_router, prefix="/api/v1")
app.include_router(alert_router, prefix="/api/v1")
app.include_router(backtest_router, prefix="/api/v1")

@app.on_event("startup")
def startup_event():
    # Import semua model agar Base.metadata tahu semua tabel
    import app.db.models  # noqa: F401
    
    # Auto-create semua tabel di database (SQLite/PostgreSQL)
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified successfully.")
    
    # Mulai scheduler harian otomatis (hanya jika bukan SQLite dev mode)
    if not settings.DATABASE_URL.startswith("sqlite"):
        from app.workers.scheduler import start_scheduler
        start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    if not settings.DATABASE_URL.startswith("sqlite"):
        from app.workers.scheduler import shutdown_scheduler
        shutdown_scheduler()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "message": "Welcome to Sinyal Saham AI API"
    }
