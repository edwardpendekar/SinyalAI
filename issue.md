# Rencana Implementasi Sistem: Sinyal Saham AI (IDX AI Stock Scanner)

Dokumen ini berisi spesifikasi teknis dan rencana implementasi lengkap untuk pembangunan aplikasi **Sinyal Saham AI** secara bertahap. Dokumen ini dirancang agar dapat diimplementasikan secara langsung oleh *junior programmer* maupun model AI (seperti Gemini, GPT, Claude).

---

## DAFTAR MODUL PENGERJAAN
1. **Modul 1: System Architecture & Folder Structure**
2. **Modul 2: Database Schema (PostgreSQL)**
3. **Modul 3: Data Import Engine**
4. **Modul 4: Technical Indicator Engine**
5. **Modul 5: Divergence Detection Engine (Regular & Hidden)**
6. **Modul 6: AI Screening Engine**
7. **Modul 7: AI Scoring & Ranking Algorithm**
8. **Modul 8: Web Dashboard (React + Next.js)**
9. **Modul 9: Automated AI Stock Analysis**
10. **Modul 10: Alert & Notification Engine**
11. **Modul 11: Backtesting & Risk Analysis Module**
12. **Modul 12: Production Deployment & CI/CD**

---

## MODUL 1: SYSTEM ARCHITECTURE & FOLDER STRUCTURE

Aplikasi ini menggunakan pola **Clean Architecture** yang memisahkan antara lapisan presentasi (Next.js Frontend), lapisan bisnis (Service Layer), lapisan akses data (Repository Pattern), dan model database (SQLAlchemy).

### Struktur Folder Proyek
```
sinyal-saham-ai/
├── backend/
│   ├── app/
│   │   ├── api/                    # Handler API HTTP (Endpoints / Router)
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── stocks.py
│   │   │   │   ├── scanner.py
│   │   │   │   ├── watchlist.py
│   │   │   │   ├── backtest.py
│   │   │   │   └── alerts.py
│   │   │   └── router.py
│   │   ├── core/                   # Konfigurasi Global & Keamanan
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── db/                     # Migrasi Database (Alembic) & Model
│   │   │   ├── base.py
│   │   │   ├── models.py
│   │   │   └── session.py
│   │   ├── repositories/           # Repository Pattern (Akses Data)
│   │   │   ├── base.py
│   │   │   ├── user_repository.py
│   │   │   ├── stock_repository.py
│   │   │   └── price_repository.py
│   │   ├── schemas/                # Validasi & Serialisasi Data (Pydantic)
│   │   │   ├── auth.py
│   │   │   ├── stock.py
│   │   │   └── scanner.py
│   │   ├── services/               # Service Layer (Logika Bisnis Utama)
│   │   │   ├── import_engine.py
│   │   │   ├── indicator_engine.py
│   │   │   ├── divergence_engine.py
│   │   │   ├── screening_engine.py
│   │   │   ├── scoring_engine.py
│   │   │   ├── ai_analysis.py
│   │   │   └── alert_engine.py
│   │   ├── workers/                # Background Jobs & Scheduler
│   │   │   ├── tasks.py
│   │   │   └── scheduler.py
│   │   ├── tests/                  # Automated Testing (PyTest)
│   │   └── main.py                 # FastAPI Entrypoint
│   ├── alembic/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router (Pages, Layouts)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── scanner/
│   │   │   ├── divergence/
│   │   │   └── watchlist/
│   │   ├── components/             # Reusable UI Components
│   │   │   ├── ui/                 # Atom components (buttons, inputs)
│   │   │   ├── charts/             # TradingView, Treemap, Candlestick
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── hooks/                  # Custom React Hooks (SWR/React Query)
│   │   ├── services/               # API Integration Client (Axios)
│   │   ├── store/                  # Global State (Zustand)
│   │   ├── types/                  # TypeScript Definitions
│   │   └── utils/                  # Helper Functions
│   ├── public/                     # Static Assets
│   ├── Dockerfile
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

### Penjelasan Setiap Modul
*   **`backend/app/api/`**: Menangani routing HTTP request/response. Berisi endpoints REST API.
*   **`backend/app/core/`**: Menyimpan variabel konfigurasi lingkungan (`.env`), setup JWT auth, CORS, dan inisialisasi koneksi DB.
*   **`backend/app/db/`**: Definisi struktur tabel menggunakan SQLAlchemy ORM.
*   **`backend/app/repositories/`**: Mengisolasi query database. Logika bisnis di `services` tidak boleh langsung memanggil SQLAlchemy session; melainkan lewat class repo ini.
*   **`backend/app/services/`**: Otak dari aplikasi. Logika perhitungan indikator, scanner, pencarian divergence, scoring, integrasi LLM, dan trigger alarm didefinisikan di sini.
*   **`backend/app/workers/`**: Menjalankan cron job harian menggunakan Celery/APScheduler untuk download data BEI dan memicu scanner.
*   **`frontend/src/app/`**: Pengaturan halaman web frontend berbasis framework Next.js.
*   **`frontend/src/components/charts/`**: Komponen khusus untuk visualisasi finansial dan integrasi TradingView Lightweight Charts API.

---

## MODUL 2: DATABASE SCHEMA (POSTGRESQL)

Desain database yang dinormalisasi dengan relasi penuh, primary key (PK), foreign key (FK), dan indeks optimal untuk pencarian data historis skala besar.

### ERD & SQL Script Schema

```sql
-- Aktivasi ekstensi UUID jika diperlukan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Table: permissions
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Table: role_permissions (Many-to-Many)
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: settings
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    telegram_chat_id VARCHAR(50),
    whatsapp_number VARCHAR(20),
    theme VARCHAR(10) DEFAULT 'dark',
    alert_enabled BOOLEAN DEFAULT TRUE
);

-- Table: stocks
CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) UNIQUE NOT NULL, -- Contoh: BBCA, TLKM
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    sub_sector VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    market_cap BIGINT,
    shares_outstanding BIGINT
);

-- Table: daily_prices
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
    CONSTRAINT uq_stock_date UNIQUE (stock_id, date)
);

-- Indeks untuk pencarian harga harian yang sangat cepat
CREATE INDEX idx_daily_prices_stock_date ON daily_prices (stock_id, date DESC);

-- Table: technical_indicators
CREATE TABLE technical_indicators (
    id BIGSERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    rsi NUMERIC(6,2),
    macd NUMERIC(12,4),
    macd_signal NUMERIC(12,4),
    macd_hist NUMERIC(12,4),
    ema_50 NUMERIC(12,2),
    ema_200 NUMERIC(12,2),
    sma_50 NUMERIC(12,2),
    sma_200 NUMERIC(12,2),
    atr NUMERIC(12,4),
    adx NUMERIC(6,2),
    cci NUMERIC(8,2),
    roc NUMERIC(6,2),
    vwap NUMERIC(12,2),
    supertrend NUMERIC(12,2),
    bb_upper NUMERIC(12,2),
    bb_middle NUMERIC(12,2),
    bb_lower NUMERIC(12,2),
    stoch_k NUMERIC(6,2),
    stoch_d NUMERIC(6,2),
    obv BIGINT,
    mfi NUMERIC(6,2),
    ichimoku_tenkan NUMERIC(12,2),
    ichimoku_kijun NUMERIC(12,2),
    CONSTRAINT uq_tech_indicator UNIQUE (stock_id, date)
);

CREATE INDEX idx_tech_indicators_date ON technical_indicators (stock_id, date DESC);

-- Table: financials (Laporan Keuangan Tahunan & Kuartalan)
CREATE TABLE financials (
    id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    quarter VARCHAR(2) NOT NULL, -- FY, Q1, Q2, Q3
    revenue BIGINT,
    net_income BIGINT,
    eps NUMERIC(10,2),
    roe NUMERIC(6,2), -- Persen
    der NUMERIC(6,2), -- Rasio
    per NUMERIC(6,2),
    pbv NUMERIC(6,2),
    dividend_yield NUMERIC(6,2),
    book_value BIGINT,
    cash_flow_operating BIGINT,
    CONSTRAINT uq_financial_period UNIQUE (stock_id, year, quarter)
);

-- Table: foreign_flow
CREATE TABLE foreign_flow (
    id BIGSERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    foreign_buy BIGINT NOT NULL,
    foreign_sell BIGINT NOT NULL,
    net_foreign BIGINT NOT NULL,
    net_foreign_accum_20d BIGINT,
    CONSTRAINT uq_foreign_flow UNIQUE (stock_id, date)
);

CREATE INDEX idx_foreign_flow_date ON foreign_flow (stock_id, date DESC);

-- Table: broker_summary
CREATE TABLE broker_summary (
    id BIGSERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    broker_code VARCHAR(5) NOT NULL,
    volume BIGINT NOT NULL,
    value BIGINT NOT NULL,
    type VARCHAR(2) CHECK (type IN ('B', 'S')), -- B = Buyer, S = Seller
    CONSTRAINT uq_broker_sum UNIQUE (stock_id, date, broker_code, type)
);

-- Table: dividend
CREATE TABLE dividend (
    id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    ex_date DATE NOT NULL,
    amount_per_share NUMERIC(10,2) NOT NULL,
    payment_date DATE
);

-- Table: corporate_action
CREATE TABLE corporate_action (
    id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- Stock Split, Reverse Split, Rights Issue, Warrant
    ratio VARCHAR(20) NOT NULL,
    ex_date DATE NOT NULL
);

-- Table: watchlist
CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_watchlist UNIQUE (user_id, stock_id)
);

-- Table: portfolio
CREATE TABLE portfolio (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    avg_price NUMERIC(12,2) NOT NULL,
    quantity INTEGER NOT NULL, -- Dalam lot
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    type VARCHAR(4) CHECK (type IN ('BUY', 'SELL')),
    price NUMERIC(12,2) NOT NULL,
    quantity INTEGER NOT NULL, -- Lot
    fee NUMERIC(8,2) DEFAULT 0.0,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: scanner_results
CREATE TABLE scanner_results (
    id BIGSERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    ai_score INTEGER CHECK (ai_score BETWEEN 0 AND 100),
    conditions_passed JSONB, -- list dari kondisi yang dipenuhi (e.g. ["Close > MA50", "RSI Hidden Bullish"])
    recommendation VARCHAR(20), -- Strong Buy, Buy, Hold, Avoid
    target_price NUMERIC(12,2),
    stop_loss NUMERIC(12,2),
    expected_return NUMERIC(6,2),
    risk_reward_ratio NUMERIC(4,2),
    CONSTRAINT uq_scanner_res UNIQUE (stock_id, date)
);

CREATE INDEX idx_scanner_results_date ON scanner_results (date DESC, ai_score DESC);

-- Table: alerts
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    condition_type VARCHAR(50) NOT NULL, -- PRICE_ABOVE, PRICE_BELOW, DIVERGENCE, GOLDEN_CROSS
    threshold_value NUMERIC(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: alert_logs
CREATE TABLE alert_logs (
    id BIGSERIAL PRIMARY KEY,
    alert_id INTEGER REFERENCES alerts(id) ON DELETE CASCADE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'SENT' -- SENT, FAILED
);

-- Table: news
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT UNIQUE NOT NULL,
    source VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sentiment_score NUMERIC(4,2) -- -1.0 s.d +1.0
);

-- Table: market_sentiment
CREATE TABLE market_sentiment (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    fear_greed_index INTEGER,
    ihsg_sentiment VARCHAR(20),
    foreign_net_total BIGINT
);

-- Table: system_logs
CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(10) NOT NULL,
    module VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT
);
```

---

## MODUL 3: DATA IMPORT ENGINE

Mesin pengunduh data otomatis yang mendukung pembagian data harian secara *incremental* dari berbagai API.

### Konsep Pengumpulan Data
*   **Ticker/Stocks List**: Didapatkan dari list emiten resmi BEI (IDX).
*   **Daily Prices**: Yahoo Finance API (menggunakan `yfinance` library Python) atau Polygon.io / AlphaVantage sebagai cadangan.
*   **Foreign Flow & Broker Summary**: Pengolahan raw JSON dari website IDX API `/stats-broker` dan data net foreign harian.

### Spesifikasi Logika (Incremental & Error Resilience)
1.  **Deduplikasi**: Query data terbaru di DB terlebih dahulu sebelum menyimpan entri baru (`uq_stock_date` mencegah duplikat).
2.  **Scheduler**: Berjalan harian setiap pukul 16:30 WIB (Pasar BEI tutup jam 16:00 WIB).
3.  **Mekanisme Retry**: Jika API gagal merespons, scheduler melakukan percobaan ulang (retry) 3 kali dengan jeda eksponensial (10 detik, 30 detik, 90 detik).
4.  **Logging**: Kesalahan dicatat ke `system_logs` dengan tingkat keparahan `ERROR` beserta *stack trace*-nya.

---

## MODUL 4: TECHNICAL INDICATOR ENGINE

Mesin penghitungan indikator teknis untuk seluruh saham BEI yang dioptimalkan secara performansi menggunakan vectorized operations Pandas dan NumPy (bukan *looping* baris-per-baris).

### Detail Formula Indikator
1.  **RSI**: 14 Periode.
2.  **MACD**: Fast=12, Slow=26, Signal=9.
3.  **SMA/EMA**: 50 & 200 untuk menentukan Golden/Death Cross.
4.  **ATR (Average True Range)**: 14 Periode untuk batas volatilitas stop loss.
5.  **VWAP (Volume Weighted Average Price)**: Diperlukan untuk screening area akumulasi bandar.
6.  **Supertrend**: Period=10, Multiplier=3.
7.  **Bollinger Bands**: Period=20, StdDev=2.
8.  **Stochastic Oscillator**: %K = 14, %D = 3.
9.  **Money Flow Index (MFI)**: 14 Periode.
10. **Ichimoku Kinko Hyo**: Tenkan-sen (9), Kijun-sen (26), Senkou Span A/B (52).

### Optimalisasi Kode Python (Contoh Kerangka Pendekatan Vectorized)
```python
import pandas as pd
import numpy as np

def calculate_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / (loss + 1e-10) # cegah zero division
    return 100 - (100 / (1 + rs))

def calculate_macd(prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9):
    ema_fast = prices.ewm(span=fast, adjust=False).mean()
    ema_slow = prices.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    macd_hist = macd_line - signal_line
    return macd_line, signal_line, macd_hist
```

---

## MODUL 5: DIVERGENCE DETECTION ENGINE

Mendeteksi perbedaan arah antara pergerakan harga saham dan oscillator indikator (RSI, MACD, Stochastic, CCI) tanpa mengalami *repaint* (perubahan sinyal masa lalu saat data baru masuk).

### Klasifikasi Divergence
*   **Regular Bullish Divergence**: Harga mencatat *Lower Low* (LL), namun Indikator mencatat *Higher Low* (HL). (Sinyal pembalikan arah naik / *Bullish Reversal*).
*   **Hidden Bullish Divergence**: Harga mencatat *Higher Low* (HL), namun Indikator mencatat *Lower Low* (LL). (Sinyal penerusan tren naik / *Trend Continuation*).
*   **Regular Bearish Divergence**: Harga mencatat *Higher High* (HH), namun Indikator mencatat *Lower High* (LH). (Sinyal pembalikan arah turun / *Bearish Reversal*).
*   **Hidden Bearish Divergence**: Harga mencatat *Lower High* (LH), namun Indikator mencatat *Higher High* (HH). (Sinyal penerusan tren turun / *Trend Continuation*).

### Aturan Deteksi (Pivot-Based & Non-Repaint)
1.  **Pivot Point (High/Low)** ditentukan menggunakan parameter `Pivot Length` (default = 5). Berarti, pivot low dikonfirmasi jika titik terendah lebih rendah dibanding 5 hari sebelumnya dan 5 hari sesudahnya.
2.  **No Repaint**: Sinyal baru dianggap sah (ditulis ke DB) setelah bar/hari konfirmasi pivot selesai dibentuk (yaitu setelah `N` hari berlalu dari titik ekstrim).
3.  **Confidence Score**: Dihitung berdasarkan tingkat divergensi, volume konfirmasi saat pivot terbentuk, dan tren mayor (menggunakan MA200).

---

## MODUL 6: AI SCREENING ENGINE

Menyaring seluruh saham BEI secara otomatis untuk menemukan kandidat saham terbaik berdasarkan kombinasi analisis teknikal, fundamental, dan pergerakan dana asing (Foreign Flow).

### Filter Kondisi Kriteria
*   **Kriteria Tren**:
    *   `Close > EMA50` dan `Close > EMA200`
    *   `EMA50 > EMA200` (Status: Golden Cross / Uptrend)
*   **Kriteria Volatilitas & Volume**:
    *   `Volume > SMA20 Volume`
    *   `Relative Volume (RVOL) > 1.2` (Ada peningkatan aktivitas transaksi dibanding rata-rata)
*   **Kriteria Divergence**:
    *   Terdeteksi `Hidden Bullish RSI` ATAU `Hidden Bullish MACD` dalam 3 hari terakhir.
*   **Kriteria Fundamental (Value/Growth)**:
    *   `ROE (Return on Equity) > 15%`
    *   `PER (Price to Earnings Ratio) < 15`
    *   `PBV (Price to Book Value) < 2.0`
    *   `DER (Debt to Equity Ratio) < 1.0` (Struktur modal sehat)
    *   `Revenue Growth > 10% YoY` & `EPS Growth > 5% YoY`
    *   `Market Cap > Rp 2 Triliun` (Likuiditas aman)
*   **Kriteria Bandar / Foreign Flow**:
    *   `Net Foreign Buy` bernilai positif beruntun dalam 5 hari terakhir.

---

## MODUL 7: AI SCORING & RANKING ALGORITHM

Menggabungkan seluruh kriteria dari Modul 6 ke dalam satu nilai kuantitatif berkisar antara **0 hingga 100** untuk merangking emiten potensial.

### Bobot Penilaian (Weighting System)
| Kategori | Bobot | Parameter Evaluasi |
| :--- | :--- | :--- |
| **Trend** | 25% | Posisi MA, kekuatan tren (ADX), Ichimoku |
| **Momentum** | 20% | Divergence RSI/MACD, Stochastic oversold |
| **Volume** | 10% | Breakout Volume, Money Flow Index (MFI) |
| **Foreign Flow**| 10% | Akumulasi asing jangka pendek & menengah |
| **Fundamental**| 25% | Pertumbuhan laba (ROE, EPS), valuasi murah |
| **Dividend** | 5% | Rasio historis Dividend Yield |
| **Risk** | 5% | Beta saham, rasio DER |

### Format Output Keputusan
*   **Score**: Rata-rata tertimbang (0-100).
*   **Recommendation**:
    *   `Score >= 80`: **Strong Buy**
    *   `60 <= Score < 80`: **Buy**
    *   `40 <= Score < 60`: **Hold**
    *   `Score < 40`: **Avoid**
*   **Target Price**: Berdasarkan rata-rata valuasi wajar DCF (Discounted Cash Flow), target PER historis, dan target PBV historis.
*   **Expected Return**: Selisih persentase harga saat ini dengan Target Price.
*   **Risk Reward Ratio & Position Sizing**: Menggunakan ATR untuk meletakkan stop loss di bawah swing low dan merekomendasikan maksimum alokasi modal per saham (misal 5% - 10% dari total ekuitas).

---

## MODUL 8: WEB DASHBOARD (REACT + NEXT.JS)

Frontend premium, modern, dan responsif menggunakan React, Next.js, TailwindCSS, dan Chart interaktif.

### Navigasi & Struktur Halaman
1.  **Dashboard Utama**: Menampilkan indeks pasar (IHSG), Fear & Greed Index, Ringkasan Transaksi Asing (Net Foreign Buy/Sell harian), dan 5 saham teratas hasil scan AI.
2.  **Scanner**: Halaman filter kustom di mana user dapat mengaktifkan filter teknikal/fundamental spesifik dan melihat tabel peringkat saham secara real-time.
3.  **Divergence Board**: Panel khusus list emiten yang sedang mendeteksi Regular/Hidden Divergence RSI, MACD, dsb.
4.  **Watchlist & Portfolio Tracker**: Simulasi pencatatan portofolio pengguna beserta visualisasi persentase untung/rugi.
5.  **TradingView Chart Page**: Integrasi *Lightweight Charts* dengan plot otomatis garis MA50/200, penanda sinyal Divergence, dan overlay volume transaksi.
6.  **Backtest Panel**: Input form parameter strategi untuk melihat performa simulasi historis sebelum diterapkan.

---

## MODUL 9: AUTOMATED AI STOCK ANALYSIS

Mesin otomatis pembuat analisis saham mendalam berbasis AI (menggunakan API eksternal seperti Google Gemini API).

### Struktur Laporan Analisis AI (Output Markdown)
Setiap emiten yang diklik oleh user akan menghasilkan dokumen analisis terotomatisasi dengan struktur:
1.  **Ringkasan Bisnis**: Profil singkat, katalis industri saat ini.
2.  **Analisis Teknikal**: Interpretasi posisi MA50/200, indikator osilator, dan pola grafik yang terbentuk.
3.  **Analisis Fundamental**: Evaluasi kinerja laporan keuangan kuartal terakhir.
4.  **Perhitungan Valuasi**:
    *   Estimasi DCF (Discounted Cash Flow) wajar.
    *   Perbandingan PER dan PBV terhadap rata-rata industri.
5.  **Analisis Risiko**: Mengukur volatilitas harga saham (Beta) dan struktur utang emiten.
6.  **Kesimpulan & Rekomendasi**: Target harga beli, target profit taking, dan batas cut loss.

---

## MODUL 10: ALERT & NOTIFICATION ENGINE

Sistem peringatan real-time yang memantau pergerakan harga dan sinyal scanner secara terus menerus untuk dikirimkan ke perangkat pengguna.

### Integrasi Saluran Distribusi
*   **Telegram Bot API**: Mengirimkan alert dalam format pesan kaya teks (Rich Text/HTML) ke grup premium atau chat personal.
*   **WhatsApp API (Gateway)**: Mengirimkan alert langsung ke nomor telepon pengguna terdaftar.
*   **Browser Webhook**: Notifikasi push langsung di dashboard web saat aktif.

### Kondisi Pemicu Alert (Trigger Condition)
*   Terbentuknya sinyal `Hidden Bullish` atau `Golden Cross` baru pasca pasar tutup.
*   Harga menembus Target Price atau batas Stop Loss yang telah diset pengguna di portofolionya.
*   Peningkatan volume transaksi mendadak (*Volume Breakout*) selama jam perdagangan aktif.

---

## MODUL 11: BACKTESTING & RISK ANALYSIS MODULE

Alat bantu untuk menguji strategi screening di masa lalu guna mengukur probabilitas keberhasilan sebelum diimplementasikan.

### Metrik Evaluasi Backtest
*   **Win Rate**: Rasio transaksi profit dibanding total transaksi.
*   **Sharpe Ratio & Sortino Ratio**: Mengukur tingkat return yang disesuaikan terhadap risiko deviasi negatif.
*   **Profit Factor**: Total kotor profit dibagi total kotor loss.
*   **Maximum Drawdown (MDD)**: Kerugian penurunan ekuitas terdalam dari titik puncak ke titik terendah.
*   **Expectancy**: Rata-rata ekspektasi profit bersih per transaksi.
*   **Average Holding Days**: Rata-rata durasi memegang saham per transaksi.

---

## MODUL 12: PRODUCTION DEPLOYMENT & CI/CD

Arsitektur deployment tangguh menggunakan containerization Docker untuk memastikan aplikasi berjalan konsisten di server Ubuntu produksi.

### Docker Compose Configuration Blueprint
Menjalankan FastAPI backend, PostgreSQL database, Next.js frontend, Redis (untuk Celery queue/caching), dan Nginx reverse proxy dengan Let's Encrypt SSL.

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: sinyal_db
    environment:
      POSTGRES_DB: sinyal_ai
      POSTGRES_USER: quant_user
      POSTGRES_PASSWORD: securepassword123
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:alpine
    container_name: sinyal_redis
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    container_name: sinyal_backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://quant_user:securepassword123@db/sinyal_ai
      - REDIS_URL=redis://redis:6379/0
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    container_name: sinyal_frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  pgdata:
```

### Prosedur CI/CD (GitHub Actions)
1.  **Tahap Linter & Pengujian**: Jalankan `flake8` dan `pytest` di backend, `eslint` di frontend.
2.  **Build & Push**: Jika pengujian sukses, buat Docker image baru dan unggah ke Docker Hub / GitHub Container Registry.
3.  **Auto Deploy**: SSH otomatis ke Server Ubuntu, jalankan script pull image terbaru, dan jalankan `docker compose up -d` ulang secara *zero-downtime*.
