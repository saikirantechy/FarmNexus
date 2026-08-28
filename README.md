# 🌱 FarmNexus — Know Your Farm. Know Your Money.

**FarmNexus** is a production-ready, multilingual, mobile-first **Farm Business Operating System** built for farmers to answer the most critical question:

> **“After all my farming expenses, harvest, commissions, labour and sales, am I actually making a profit or a loss?”**

---

## 🚀 Key Modules & Capabilities

1. **Deterministic P&L Financial Engine**:
   - Strictly eliminates floating-point errors using exact integer/decimal minor-unit arithmetic.
   - Clear accounting distinction between **Revenue** (realized crop sales), **Expenses** (direct inputs + labour + commissions), **Receivables** (uncollected buyer payments), **Payables** (unpaid worker wages/vendor dues), and **Net Profit/Loss**.
   - Computes unit economics: *Cost per box*, *Cost per kg*, *Average selling price*, and *Profit margin %*.

2. **Multilingual Architecture (6 Languages)**:
   - Full native localization in **English**, **हिन्दी (Hindi)**, **ಕನ್ನಡ (Kannada)**, **मराठी (Marathi)**, **తెలుగు (Telugu)**, and **தமிழ் (Tamil)**.

3. **AI Voice & Text Assistant**:
   - Web Speech API integration in all 6 Indian languages.
   - Natural language transaction parser (e.g., *"Today 5 workers came and picked 42 boxes. Rate was 50 rupees."* $\rightarrow$ Automatically extracts Labour and Harvest records with a conversational confirmation step).

4. **AI Crop Doctor & Disease Diagnosis**:
   - Leaf symptom photo diagnosis for Early Blight, Late Blight, Tomato Leaf Curl Virus, Fruit Borer, and Blossom End Rot (Calcium deficiency).
   - Biological remedies, chemical controls with Pre-Harvest Interval (PHI) safety reminders, and mandatory local KVK / agriculture expert advisory disclaimers.

5. **Realistic Pre-Loaded Tomato Demo Dataset**:
   - 1-Click loading of a complete 2-acre Tomato farm model with **1,542 boxes harvest**, **166 labour working-member entries**, upcoming sales ($68 \times ₹270 = ₹18,360$, $110 \times ₹70 = ₹7,700$, $50 \times ₹90 = ₹4,500$, $80 \times ₹50 = ₹4,000$ totaling $308\text{ boxes} = ₹34,560$), and a **₹81,000 net profit balance**.

6. **APMC Mandi Market Prices**:
   - Daily wholesale prices, price trends, and modal prices per box and per kg across nearby markets (Kolar, Azadpur, Vashi, Madanapalle, Pimpalgaon).

7. **Agri-Weather Forecast & Alerts**:
   - 5-day weather forecast with rain probabilities and crop-specific agronomic warnings (e.g. *"Heavy rain expected tomorrow. Check drainage in tomato fields"*).

8. **Exportable Reports & FPO Admin Dashboard**:
   - Daily, weekly, crop lifecycle, and season P&L reports with 1-click **CSV** and **Printable PDF** export.
   - Dedicated FPO Admin dashboard for aggregate farmer counts, acreage, and supply insights.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + Farmer-First Earthy Design System
- **Icons**: Lucide React
- **Voice & Speech**: Web Speech API (`hi-IN`, `kn-IN`, `mr-IN`, `te-IN`, `ta-IN`, `en-IN`)
- **State & Offline Storage**: React Context + IndexedDB / LocalStorage Persistence
- **Testing**: Vitest automated test suite for financial calculations

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Financial Unit Tests
```bash
npm test
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Mathematical Test Suite

The deterministic calculations engine is validated by automated Vitest tests in `tests/financial-calculations.test.ts`:
- $68 \times 270 = ₹18,360$
- $110 \times 70 = ₹7,700$
- $50 \times 90 = ₹4,500$
- $80 \times 50 = ₹4,000$
- Total Upcoming: $308\text{ boxes} = ₹34,560$
- 10% Commission on $₹1,40,000 = ₹14,000 \rightarrow \text{Net } ₹1,26,000$
- Labour: $62 \times 500 = ₹31,000$, $100 \times 350 = ₹35,000$, Food $162 \times 50 = ₹8,100 \rightarrow \text{Total } ₹74,100$
- P&L: Revenue $₹1,40,000 - \text{Expenses } ₹59,000 = \text{Net Profit } ₹81,000$
