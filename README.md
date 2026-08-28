<div align="center">

# 🌾 FarmNexus

### Know Your Farm. Know Your Money.

**A mobile-first, multilingual Farm Business Operating System for Indian farmers**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-6e9f18?logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📖 Overview

FarmNexus is a **production-ready farm management platform** built to answer every farmer's most important question:

> **"After all my farming expenses, harvest, commissions, labour and sales — am I actually making a profit or a loss?"**

It is **not** a generic agriculture news or advisory app. FarmNexus is a **real financial operating system** that helps farmers track every rupee in and out of their farm business.

---

## ✨ Features

### 💰 Financial Intelligence
- **Real-time Profit & Loss Dashboard** — instant net P&L after commissions, labour, and deductions
- **Paise-exact math** — every amount is rounded deterministically to the nearest paisa so ₹68 × 270 = ₹18,360 every time, with no floating-point drift
- **Gross → Net calculation** — Sales − Commission − Transport − Other Deductions = Net Amount
- **Receivables & Payables tracking** — who owes you money, who you owe

### 🌾 Harvest Management
- Record harvest batches by boxes, weight, grade (A/B/C/Mixed)
- Multi-field, multi-crop-cycle support
- Estimated vs actual price tracking

### 👷 Labour Management
- Daily wage recording with male/female worker counts
- Food cost, transport cost, advance paid tracking
- Balance payable computation
- 166-worker-day Tomato demo scenario included

### 💸 Expense Ledger
- 21 expense categories (Seeds, Fertilizer, Pesticide, Labour, Diesel, etc.)
- Vendor tracking, payment status (Paid / Pending / Partial)
- Receipt URL attachment support

### 🏪 Sales & Commission Tracking
- Three commission models: Percentage, Per Box, Fixed Amount
- Buyer name, APMC market, transport cost, other deductions
- Payment status tracking with pending balance

### 📦 Inventory Management *(New)*
- Track seeds, fertilizers, pesticides, packaging by quantity
- Low-stock threshold alerts
- Purchase / Usage / Adjustment transactions
- Per-farm inventory isolation

### ✅ Task Manager *(New)*
- Schedule farm tasks: Irrigation, Spraying, Scouting, Harvest, Labour
- Due-date reminders
- Mark complete / incomplete

### 🤖 AI Assistant
- **Voice Transactions**: Speak naturally — "Today 50 boxes harvested at ₹280" — auto-extracted
- **AI Crop Doctor**: Symptom-based disease diagnosis with organic and chemical remedies
- Multi-language NLP parsing (English, Hindi, Kannada, Marathi, Telugu, Tamil)

### 📊 Reports & Export
- Full financial report with P&L breakdown
- Unit economics (cost per box, revenue per box)
- CSV / PDF export ready

### 🏪 Mandi Prices
- Live APMC market price simulation
- Price trends (up/down/stable) with percentage change
- Distance-sorted market list

### 🌦️ Agricultural Weather
- 7-day forecast with rain probability
- Crop-specific alerts (spray window, harvest delay, frost warning)

### 👥 FPO Admin Dashboard
- Multi-farmer overview for Farmer Producer Organisations
- Aggregate P&L, pending payments, activity summary

---

## 🌍 Multilingual Support

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Complete |
| Hindi | `hi` | ✅ Complete |
| Kannada | `kn` | ✅ Complete |
| Marathi | `mr` | ✅ Complete |
| Telugu | `te` | ✅ Complete |
| Tamil | `ta` | ✅ Complete |

Switch language from the header — all UI labels, alerts, and navigation update instantly.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/saikirantechy/FarmNexus.git
cd FarmNexus
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Run Tests

```bash
npm test
```

---

## 🗂️ Project Structure

```
FarmNexus/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── page.tsx                # Root redirect → /dashboard
│   │   ├── layout.tsx              # App shell with providers
│   │   ├── globals.css             # Global styles
│   │   ├── dashboard/              # P&L overview dashboard
│   │   ├── harvest/                # Harvest logging
│   │   ├── money/                  # Expenses, labour, sales
│   │   ├── inventory/              # Input stock management
│   │   ├── tasks/                  # Farm task scheduler
│   │   ├── ai-assistant/           # Voice & crop doctor AI
│   │   ├── mandi-prices/           # APMC market prices
│   │   ├── weather/                # Agricultural weather
│   │   ├── reports/                # Financial reports & export
│   │   ├── farm/                   # Farm & crop cycle setup
│   │   ├── calculator/             # Standalone profit calculator
│   │   ├── onboarding/             # New user setup flow
│   │   ├── settings/               # User profile & preferences
│   │   ├── admin/                  # FPO admin overview
│   │   └── farm-bot/               # AI farm bot (experimental)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Top bar with lang switcher & notifications
│   │   │   ├── BottomNav.tsx       # Mobile bottom navigation
│   │   │   └── QuickAddModal.tsx   # Quick add sheet (harvest/expense/sale)
│   │   ├── dashboard/
│   │   │   ├── HeroProfitLossCard.tsx  # Big P&L hero card
│   │   │   ├── StatCard.tsx            # Summary stat cards
│   │   │   ├── RecentHarvestTable.tsx  # Latest harvest entries
│   │   │   └── UpcomingSalesCard.tsx   # Pending receivables
│   │   └── ai/
│   │       ├── VoiceTransactionRecorder.tsx  # Web Speech API recorder
│   │       └── CropDoctorModal.tsx           # Disease diagnosis UI
│   │
│   ├── lib/
│   │   ├── farm-store.tsx          # Global React state & LocalStorage sync
│   │   ├── calculations.ts         # Deterministic financial engine
│   │   ├── ai-service.ts           # NLP transaction parser & crop disease KB
│   │   ├── demo-data.ts            # Tomato demo dataset (1,542 boxes)
│   │   └── i18n/
│   │       ├── dictionaries.ts     # 6-language translation strings
│   │       └── LanguageContext.tsx # Language provider
│   │
│   └── types/
│       └── index.ts                # All TypeScript interfaces & types
│
├── tests/
│   └── financial-calculations.test.ts  # Vitest unit tests for P&L engine
│
├── public/
│   └── manifest.json               # PWA manifest
│
├── .env.example                    # Environment variable template
├── next.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🍅 Tomato Demo Dataset

Click **"Load Tomato Demo"** on the dashboard to load a realistic Tomato farming season:

| Metric | Value |
|--------|-------|
| Total Harvest | 1,542 boxes |
| Harvest Batches | 18 |
| Labour Records | 3 (166 worker-days total) |
| Total Workers | 166 worker-days |
| Gross Sales | ₹1,93,060 |
| Net Profit | ~₹36,860 |
| Commission Rate | 10% |

This demonstrates all calculations including partial payments, pending balances, and food costs.

---

## 🧮 Financial Calculation Engine

All arithmetic is implemented in [`src/lib/calculations.ts`](src/lib/calculations.ts) using deterministic **paise rounding** to avoid floating-point drift:

```
Gross Sales    = Boxes × Price Per Box
Commission     = Gross × Rate% (rounded to nearest paisa)
Net Amount     = Gross − Commission − Transport − Other Deductions
Net P&L        = Total Net Sales − Labour Cost − Direct Expenses
Profit Margin  = (Net P&L / Total Revenue) × 100
```

**Example (verified by unit tests):**
```
68 boxes × ₹270 = ₹18,360 ✅  (not ₹18,359.99)
10% of ₹1,40,000 = ₹14,000 ✅
```

Run `npm test` to validate the whole financial engine (5 test suites, 25+ assertions).

---

## 📱 Mobile-First Design

- Bottom navigation bar for thumb-friendly operation
- Large tap targets throughout
- Works offline — all data persisted to **LocalStorage**
- PWA-ready with `manifest.json`

---

## 🔐 Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | App display name | FarmNexus |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API (for AI features) | Optional |
| `NEXT_PUBLIC_WEATHER_API_KEY` | OpenWeatherMap API key | Optional |

> **Note**: The app works fully offline without any API keys, using built-in NLP and mock data.

---

## 🧪 Testing

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

Tests cover:
- Gross sales calculation
- Commission computation (percentage, per-box, fixed)
- Net amount after all deductions
- Labour total cost with food & transport
- Financial summary aggregation
- Edge cases (zero values, pending payments)

---

## 🛣️ Roadmap

- [ ] **Real Mandi API** — Connect to Agmarknet / eNAM live prices
- [ ] **Real Weather API** — OpenWeatherMap / IMD integration
- [ ] **Gemini AI** — Full LLM-powered transaction extraction
- [ ] **WhatsApp Bot** — Record transactions via WhatsApp message
- [ ] **Cloud Sync** — Firebase / Supabase backend
- [ ] **SMS Alerts** — Payment due reminders via Twilio
- [ ] **Regional FPO Portal** — Multi-farmer aggregate dashboard
- [ ] **Photo Receipt** — Camera OCR for expense receipts
- [ ] **Soil Health** — Nutrient tracking over seasons

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍🌾 Built For

Indian farmers who deserve **simple, powerful tools** in their own language — tools that treat their farm like the business it is.

> *"Every farmer is a small business owner. FarmNexus is their accounting system."*

---

<div align="center">
Made with ❤️ for Indian Farmers
<br/>
<strong>FarmNexus — Know Your Farm. Know Your Money.</strong>
</div>
