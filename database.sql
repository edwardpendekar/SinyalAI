-- ==========================================
-- Sinyal Saham AI: Complete PostgreSQL Schema
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------
-- 1. Roles & Permissions (Access Control)
-- ------------------------------------------

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ------------------------------------------
-- 2. User Accounts & Preferences
-- ------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    telegram_chat_id VARCHAR(50),
    whatsapp_number VARCHAR(20),
    theme VARCHAR(10) DEFAULT 'dark',
    alert_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------
-- 3. Core Stock Market Reference Data
-- ------------------------------------------

CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    sub_sector VARCHAR(100),
    market_cap BIGINT,
    shares_outstanding BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_prices (
    id BIGSERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    open NUMERIC(12, 2) NOT NULL,
    high NUMERIC(12, 2) NOT NULL,
    low NUMERIC(12, 2) NOT NULL,
    close NUMERIC(12, 2) NOT NULL,
    volume BIGINT NOT NULL,
    value BIGINT NOT NULL,
    frequency INTEGER NOT NULL,
    CONSTRAINT uq_stock_price_date UNIQUE (stock_id, date)
);

-- ------------------------------------------
-- 4. Financial Statements & Analysis
-- ------------------------------------------

CREATE TABLE financials (
    id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    quarter VARCHAR(2) NOT NULL, -- FY, Q1, Q2, Q3, Q4
    revenue BIGINT,
    net_income BIGINT,
    eps NUMERIC(10, 2),
    roe NUMERIC(6, 2),
    der NUMERIC(6, 2),
    per NUMERIC(6, 2),
    pbv NUMERIC(6, 2),
    dividend_yield NUMERIC(6, 2),
    book_value BIGINT,
    cash_flow_operating BIGINT,
    CONSTRAINT uq_stock_financial_period UNIQUE (stock_id, year, quarter)
);

-- ------------------------------------------
-- 5. Foreign Flow & Broker Summary
-- ------------------------------------------

CREATE TABLE foreign_flow (
    id BIGSERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    foreign_buy BIGINT NOT NULL DEFAULT 0,
    foreign_sell BIGINT NOT NULL DEFAULT 0,
    net_foreign BIGINT NOT NULL DEFAULT 0,
    net_foreign_accum_20d BIGINT,
    CONSTRAINT uq_stock_foreign_date UNIQUE (stock_id, date)
);

CREATE TABLE broker_summary (
    id BIGSERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    broker_code VARCHAR(5) NOT NULL,
    volume BIGINT NOT NULL DEFAULT 0,
    value BIGINT NOT NULL DEFAULT 0,
    type CHAR(1) CHECK (type IN ('B', 'S')), -- 'B' (Buy), 'S' (Sell)
    CONSTRAINT uq_broker_summary_key UNIQUE (stock_id, date, broker_code, type)
);

-- ------------------------------------------
-- 6. Corporate Actions & Dividends
-- ------------------------------------------

CREATE TABLE dividend (
    id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    ex_date DATE NOT NULL,
    amount_per_share NUMERIC(12, 2) NOT NULL,
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE corporate_action (
    id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- e.g., 'Stock Split', 'Reverse Split', 'Rights Issue'
    ratio VARCHAR(20) NOT NULL,
    ex_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------
-- 7. Technical Indicators & AI Scanner
-- ------------------------------------------

CREATE TABLE technical_indicators (
    id BIGSERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    rsi NUMERIC(6, 2),
    macd NUMERIC(12, 4),
    macd_signal NUMERIC(12, 4),
    macd_hist NUMERIC(12, 4),
    ema_50 NUMERIC(12, 2),
    ema_200 NUMERIC(12, 2),
    sma_50 NUMERIC(12, 2),
    sma_200 NUMERIC(12, 2),
    atr NUMERIC(12, 4),
    adx NUMERIC(6, 2),
    cci NUMERIC(8, 2),
    roc NUMERIC(6, 2),
    vwap NUMERIC(12, 2),
    supertrend NUMERIC(12, 2),
    bb_upper NUMERIC(12, 2),
    bb_middle NUMERIC(12, 2),
    bb_lower NUMERIC(12, 2),
    stoch_k NUMERIC(6, 2),
    stoch_d NUMERIC(6, 2),
    obv BIGINT,
    mfi NUMERIC(6, 2),
    ichimoku_tenkan NUMERIC(12, 2),
    ichimoku_kijun NUMERIC(12, 2),
    CONSTRAINT uq_stock_indicator_date UNIQUE (stock_id, date)
);

CREATE TABLE scanner_results (
    id BIGSERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    ai_score INTEGER CHECK (ai_score BETWEEN 0 AND 100),
    conditions_passed JSONB NOT NULL,
    recommendation VARCHAR(20) NOT NULL, -- 'Strong Buy', 'Buy', 'Hold', 'Avoid'
    target_price NUMERIC(12, 2),
    stop_loss NUMERIC(12, 2),
    expected_return NUMERIC(6, 2),
    risk_reward_ratio NUMERIC(4, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_stock_scanner_date UNIQUE (stock_id, date)
);

-- ------------------------------------------
-- 8. Watchlists & Portfolio & Transactions
-- ------------------------------------------

CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_watchlist UNIQUE (user_id, stock_id)
);

CREATE TABLE portfolio (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    avg_price NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL, -- Jumlah dalam LOT (1 Lot = 100 lembar)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_portfolio UNIQUE (user_id, stock_id)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    type VARCHAR(4) CHECK (type IN ('BUY', 'SELL')),
    price NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL, -- Jumlah dalam LOT
    fee NUMERIC(8, 2) DEFAULT 0.00,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------
-- 9. News, Sentiment, Alerts & Logs
-- ------------------------------------------

CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT UNIQUE NOT NULL,
    source VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sentiment_score NUMERIC(4, 2), -- -1.00 s.d 1.00
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE market_sentiment (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    fear_greed_index INTEGER CHECK (fear_greed_index BETWEEN 0 AND 100),
    ihsg_sentiment VARCHAR(20), -- 'Bullish', 'Bearish', 'Sideways'
    foreign_net_total BIGINT DEFAULT 0
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    condition_type VARCHAR(50) NOT NULL, -- e.g., 'PRICE_ABOVE', 'PRICE_BELOW', 'DIVERGENCE'
    threshold_value NUMERIC(12, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alert_logs (
    id BIGSERIAL PRIMARY KEY,
    alert_id INTEGER REFERENCES alerts(id) ON DELETE CASCADE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'SENT' -- 'SENT', 'FAILED', 'PENDING'
);

CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(10) NOT NULL, -- 'DEBUG', 'INFO', 'WARNING', 'ERROR'
    module VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT
);

-- ==========================================
-- INDEXES OPTIMIZATION (Untuk Query Tercepat)
-- ==========================================

-- Query Harga Harian Terkini & Historis
CREATE INDEX idx_daily_prices_stock_date ON daily_prices (stock_id, date DESC);

-- Query Analisis Indikator Teknikal
CREATE INDEX idx_tech_indicators_stock_date ON technical_indicators (stock_id, date DESC);

-- Query Pergerakan Investor Asing (Foreign Flow)
CREATE INDEX idx_foreign_flow_stock_date ON foreign_flow (stock_id, date DESC);

-- Query Aktivitas Broker (Bandarmologi)
CREATE INDEX idx_broker_summary_stock_date ON broker_summary (stock_id, date DESC);

-- Hasil Scanner Berdasarkan Score & Tanggal
CREATE INDEX idx_scanner_results_date_score ON scanner_results (date DESC, ai_score DESC);

-- Pencarian Berita Saham Berdasarkan Tanggal Publikasi
CREATE INDEX idx_news_published_at ON news (published_at DESC);
