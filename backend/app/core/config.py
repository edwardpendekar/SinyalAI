import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sinyal Saham AI"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./sinyal_ai.db"
    )
    
    # API Keys
    ALPHA_VANTAGE_API_KEY: str = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    POLYGON_API_KEY: str = os.getenv("POLYGON_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    
    # Scheduler Settings
    IMPORT_SCHEDULER_CRON: str = os.getenv("IMPORT_SCHEDULER_CRON", "30 16 * * 1-5") # Jam 16:30 Senin-Jumat

    class Config:
        case_sensitive = True

settings = Settings()
