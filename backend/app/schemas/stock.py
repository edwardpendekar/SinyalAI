from pydantic import BaseModel, Field
from datetime import date as date_type, datetime
from typing import Optional, List

class StockBase(BaseModel):
    ticker: str = Field(..., max_length=10)
    name: str
    sector: Optional[str] = None
    sub_sector: Optional[str] = None
    market_cap: Optional[int] = None
    shares_outstanding: Optional[int] = None

class StockCreate(StockBase):
    pass

class StockResponse(StockBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class DailyPriceBase(BaseModel):
    date: date_type
    open: float
    high: float
    low: float
    close: float
    volume: int
    value: int
    frequency: int

class DailyPriceCreate(DailyPriceBase):
    stock_id: int

class DailyPriceResponse(DailyPriceBase):
    id: int
    stock_id: int

    class Config:
        from_attributes = True

class ForeignFlowCreate(BaseModel):
    stock_id: int
    date: date_type
    foreign_buy: int
    foreign_sell: int
    net_foreign: int
    net_foreign_accum_20d: Optional[int] = None

class FinancialCreate(BaseModel):
    stock_id: int
    year: int
    quarter: str
    revenue: Optional[int] = None
    net_income: Optional[int] = None
    eps: Optional[float] = None
    roe: Optional[float] = None
    der: Optional[float] = None
    per: Optional[float] = None
    pbv: Optional[float] = None
    dividend_yield: Optional[float] = None
    book_value: Optional[int] = None
    cash_flow_operating: Optional[int] = None
