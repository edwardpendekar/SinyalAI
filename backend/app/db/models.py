import uuid
from sqlalchemy import Column, String, Integer, BigInteger, Numeric, Boolean, Date, DateTime, ForeignKey, Table, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

# Junction Table for Role-Permission (Many-to-Many)
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id', ondelete='CASCADE'), primary_key=True)
)

class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary=role_permissions)

class Permission(Base):
    __tablename__ = 'permissions'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = 'users'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role_id = Column(Integer, ForeignKey('roles.id', ondelete='RESTRICT'))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    role = relationship("Role", back_populates="users")
    settings = relationship("Setting", uselist=False, back_populates="user")
    watchlist = relationship("Watchlist", back_populates="user")
    portfolio = relationship("Portfolio", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    alerts = relationship("Alert", back_populates="user")

class Setting(Base):
    __tablename__ = 'settings'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    telegram_chat_id = Column(String(50))
    whatsapp_number = Column(String(20))
    theme = Column(String(10), default='dark')
    alert_enabled = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="settings")

class Stock(Base):
    __tablename__ = 'stocks'
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    sector = Column(String(100))
    sub_sector = Column(String(100))
    market_cap = Column(BigInteger)
    shares_outstanding = Column(BigInteger)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    prices = relationship("DailyPrice", back_populates="stock", cascade="all, delete-orphan")
    indicators = relationship("TechnicalIndicator", back_populates="stock", cascade="all, delete-orphan")
    financials = relationship("Financial", back_populates="stock", cascade="all, delete-orphan")
    foreign_flows = relationship("ForeignFlow", back_populates="stock", cascade="all, delete-orphan")
    broker_summaries = relationship("BrokerSummary", back_populates="stock", cascade="all, delete-orphan")
    dividends = relationship("Dividend", back_populates="stock", cascade="all, delete-orphan")
    corporate_actions = relationship("CorporateAction", back_populates="stock", cascade="all, delete-orphan")
    watchlist_entries = relationship("Watchlist", back_populates="stock", cascade="all, delete-orphan")
    portfolio_entries = relationship("Portfolio", back_populates="stock", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="stock", cascade="all, delete-orphan")
    scanner_results = relationship("ScannerResult", back_populates="stock", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="stock", cascade="all, delete-orphan")

class DailyPrice(Base):
    __tablename__ = 'daily_prices'
    id = Column(Integer, primary_key=True, autoincrement=True)
    stock_id = Column(Integer, ForeignKey('stocks.id', ondelete='CASCADE'), nullable=False)
    date = Column(Date, nullable=False, index=True)
    open = Column(Numeric(12, 2), nullable=False)
    high = Column(Numeric(12, 2), nullable=False)
    low = Column(Numeric(12, 2), nullable=False)
    close = Column(Numeric(12, 2), nullable=False)
    volume = Column(BigInteger, nullable=False)
    value = Column(BigInteger, default=0)
    frequency = Column(Integer, default=0)

    stock = relationship("Stock", back_populates="prices")

class Financial(Base):
    __tablename__ = 'financials'
    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey('stocks.id', ondelete='CASCADE'), nullable=False)
    year = Column(Integer, nullable=False)
    quarter = Column(String(2), nullable=False) # Q1, Q2, Q3, FY
    revenue = Column(BigInteger)
    net_income = Column(BigInteger)
    eps = Column(Numeric(10, 2))
    roe = Column(Numeric(6, 2))
    der = Column(Numeric(6, 2))
    per = Column(Numeric(6, 2))
    pbv = Column(Numeric(6, 2))
    dividend_yield = Column(Numeric(6, 2))
    book_value = Column(BigInteger)
    cash_flow_operating = Column(BigInteger)

    stock = relationship("Stock", back_populates="financials")

class ForeignFlow(Base):
    __tablename__ = 'foreign_flow'
    id = Column(Integer, primary_key=True, autoincrement=True)
    stock_id = Column(Integer, ForeignKey('stocks.id', ondelete='CASCADE'), nullable=False)
    date = Column(Date, nullable=False, index=True)
    foreign_buy = Column(BigInteger, nullable=False, default=0)
    foreign_sell = Column(BigInteger, nullable=False, default=0)
    net_foreign = Column(BigInteger, nullable=False, default=0)
    net_foreign_accum_20d = Column(BigInteger)

    stock = relationship("Stock", back_populates="foreign_flows")

class BrokerSummary(Base):
    __tablename__ = 'broker_summary'
    id = Column(Integer, primary_key=True, autoincrement=True)
    stock_id = Column(Integer, ForeignKey('stocks.id', ondelete='CASCADE'), nullable=False)
    date = Column(Date, nullable=False, index=True)
    broker_code = Column(String(5), nullable=False)
    volume = Column(BigInteger, nullable=False, default=0)
    value = Column(BigInteger, nullable=False, default=0)
    type = Column(String(1), nullable=False) # 'B' (Buy) or 'S' (Sell)

    stock = relationship("Stock", back_populates="broker_summaries")

class Dividend(Base):
    __tablename__ = 'dividend'
    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey('stocks.id', ondelete='CASCADE'), nullable=False)
    ex_date = Column(Date, nullable=False)
    amount_per_share = Column(Numeric(12, 2), nullable=False)
    payment_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stock = relationship("Stock", back_populates="dividends")

class CorporateAction(Base):
    __tablename__ = 'corporate_action'
    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey('stocks.id', ondelete='CASCADE'), nullable=False)
    action_type = Column(String(50), nullable=False)
    ratio = Column(String(20), nullable=False)
    ex_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stock = relationship("Stock", back_populates="corporate_actions")

class TechnicalIndicator(Base):
    __tablename__ = 'technical_indicators'
    id = Column(Integer, primary_key=True, autoincrement=True)
    stock_id = Column(Integer, ForeignKey('stocks.id', ondelete='CASCADE'), nullable=False)
    date = Column(Date, nullable=False, index=True)
    rsi = Column(Numeric(6, 2))
    macd = Column(Numeric(12, 4))
    macd_signal = Column(Numeric(12, 4))
    macd_hist = Column(Numeric(12, 4))
    ema_50 = Column(Numeric(12, 2))
    ema_200 = Column(Numeric(12, 2))
    sma_50 = Column(Numeric(12, 2))
    sma_200 = Column(Numeric(12, 2))
    atr = Column(Numeric(12, 4))
    adx = Column(Numeric(6, 2))
    cci = Column(Numeric(8, 2))
    roc = Column(Numeric(6, 2))
    vwap = Column(Numeric(12, 2))
    supertrend = Column(Numeric(12, 2))
    bb_upper = Column(Numeric(12, 2))
    bb_middle = Column(Numeric(12, 2))
    bb_lower = Column(Numeric(12, 2))
    stoch_k = Column(Numeric(6, 2))
    stoch_d = Column(Numeric(6, 2))
    obv = Column(BigInteger)
    mfi = Column(Numeric(6, 2))
    ichimoku_tenkan = Column(Numeric(12, 2))
    ichimoku_kijun = Column(Numeric(12, 2))

    stock = relationship("Stock", back_populates="indicators")

class ScannerResult(Base):
    __tablename__ = 'scanner_results'
    id = Column(Integer, primary_key=True, autoincrement=True)
    stock_id = Column(Integer, ForeignKey('stocks.id', ondelete='CASCADE'), nullable=False)
    date = Column(Date, nullable=False, index=True)
    ai_score = Column(Integer)
    conditions_passed = Column(JSON, nullable=False)
    recommendation = Column(String(20), nullable=False)
    target_price = Column(Numeric(12, 2))
    stop_loss = Column(Numeric(12, 2))
    expected_return = Column(Numeric(6, 2))
    risk_reward_ratio = Column(Numeric(10, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stock = relationship("Stock", back_populates="scanner_results")

class Watchlist(Base):
    __tablename__ = 'watchlist'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    stock_id = Column(Integer, ForeignKey('stocks.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="watchlist")
    stock = relationship("Stock", back_populates="watchlist_entries")

class Portfolio(Base):
    __tablename__ = 'portfolio'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    stock_id = Column(Integer, ForeignKey('stocks.id', ondelete='CASCADE'), nullable=False)
    avg_price = Column(Numeric(12, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="portfolio")
    stock = relationship("Stock", back_populates="portfolio_entries")

class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    stock_id = Column(Integer, ForeignKey('stocks.id', ondelete='CASCADE'), nullable=False)
    type = Column(String(4), nullable=False) # BUY, SELL
    price = Column(Numeric(12, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    fee = Column(Numeric(8, 2), default=0.00)
    date = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="transactions")
    stock = relationship("Stock", back_populates="transactions")

class Alert(Base):
    __tablename__ = 'alerts'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    stock_id = Column(Integer, ForeignKey('stocks.id', ondelete='CASCADE'), nullable=False)
    condition_type = Column(String(50), nullable=False)
    threshold_value = Column(Numeric(12, 2))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="alerts")
    stock = relationship("Stock", back_populates="alerts")
    logs = relationship("AlertLog", back_populates="alert", cascade="all, delete-orphan")

class AlertLog(Base):
    __tablename__ = 'alert_logs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_id = Column(Integer, ForeignKey('alerts.id', ondelete='CASCADE'), nullable=False)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    message = Column(Text, nullable=False)
    status = Column(String(20), default='SENT')

    alert = relationship("Alert", back_populates="logs")

class News(Base):
    __tablename__ = 'news'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    url = Column(Text, unique=True, nullable=False)
    source = Column(String(100))
    published_at = Column(DateTime(timezone=True), nullable=False)
    sentiment_score = Column(Numeric(4, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MarketSentiment(Base):
    __tablename__ = 'market_sentiment'
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False)
    fear_greed_index = Column(Integer)
    ihsg_sentiment = Column(String(20))
    foreign_net_total = Column(BigInteger, default=0)

class SystemLog(Base):
    __tablename__ = 'system_logs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    level = Column(String(10), nullable=False)
    module = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    stack_trace = Column(Text)
