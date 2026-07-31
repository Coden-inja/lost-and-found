# 🔍 Smart Campus Lost & Found System

A high-performance, AI-assisted **Smart Campus Lost & Found** web application built for **Heritage Institute of Technology (HIT), Kolkata**. The system combines real-time Supabase database persistence, Leaflet interactive campus mapping, Google Gemini AI image auto-tagging, and deterministic fuzzy text matching to seamlessly reunite students with lost items.

---

## 🌟 Key Features & Workflow

### 1. 👥 Dual-Role System (Student & Admin)
- **Role Toggle**: Seamlessly switch between **Student** and **Admin** personas without complex auth overhead.
- **Student View**: Privacy-focused view where students track their own submitted reports and receive automated match suggestions.
- **Admin View**: Comprehensive view allowing admins to browse all campus reports, filter by category/zone/date, review claim verifications, approve/reject matches, and resolve cases.

### 2. 🗺️ Interactive Campus Map (Leaflet)
- Pre-configured with exact GPS coordinates for **HIT Kolkata** campus zones:
  - 📚 **Library** (`22.5192, 88.4159`)
  - 🍔 **Canteen** (`22.5188, 88.4170`)
  - 🏢 **Hostel A** (`22.5178, 88.4155`)
  - 🏢 **Hostel B** (`22.5175, 88.4162`)
  - 🏫 **Academic Block** (`22.5185, 88.4163`)
  - 🚪 **Main Gate** (`22.5197, 88.4168`)
  - ⚽ **Sports Complex** (`22.5170, 88.4175`)
  - 🅿️ **Parking** (`22.5195, 88.4172`)
- Visual status pins on Dashboard & Browse screens:
  - 🔴 **Red**: Pending Lost Items
  - 🟢 **Green**: Pending Found Items
  - 🔵 **Blue**: Resolved / Matched Items

### 3. 🤖 AI Image Auto-Tagging (Gemini 2.0 Flash)
- Uploading an item photo automatically calls Google Gemini API.
- Generates 5–8 descriptive keyword tags (e.g., `"black, wireless, headphones, sony, padded case"`).
- Tags enrich item description metadata for enhanced match accuracy.

### 4. 🧠 Deterministic Smart Matching Engine
A pure JavaScript, instant synchronous scoring algorithm based on:
- **+40 points**: Exact `category` match (Electronics, ID/Cards, Bags, Books, Accessories, Clothing, Other).
- **+30 points**: Text similarity score between combined `description + ai_tags` using `string-similarity` (Dice's Coefficient).
- **+10 points**: Hardcoded synonym mapping match (e.g., `bag ↔ backpack`, `phone ↔ smartphone`, `laptop ↔ macbook`).
- **+20 points**: Same campus `location_zone` match.
- **Threshold**: Items scoring **≥ 50%** trigger an automatic `match_suggested` status for review.

### 5. 🔐 Claims & Verification Flow
- **Secret Verification Details**: Finders/owners can attach confidential item details (e.g., screen lock pattern description, internal engraving).
- **Admin Match Review**: Admins review claimant assertions against secret details before final approval and resolution.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + Vite
- **Styling**: Modern CSS + WebGL Procedural Gradient (`ogl` / `<Grainient />`)
- **Database**: Supabase (PostgreSQL) direct client connection via `@supabase/supabase-js`
- **Mapping**: Leaflet + `react-leaflet` (OpenStreetMap tiles)
- **Fuzzy Matching**: `string-similarity` (Dice's Coefficient)
- **AI Tagging**: Google Gemini API (`gemini-2.0-flash`)
- **Icons**: `lucide-react`

---

## 🗄️ Database Schema (`item_reports`)

The application connects directly to an existing Supabase table:

```sql
CREATE TABLE item_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR NOT NULL CHECK (report_type IN ('lost', 'found')),
  category VARCHAR NOT NULL,
  item_name VARCHAR NOT NULL,
  description TEXT,
  location_zone VARCHAR NOT NULL,
  location_lat NUMERIC(9,6),
  location_lng NUMERIC(9,6),
  item_date DATE,
  contact_name VARCHAR,
  contact_info VARCHAR NOT NULL,
  image_url TEXT,
  ai_tags TEXT[],
  secret_detail TEXT,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'match_suggested', 'admin_verifying', 'resolved')),
  matched_with UUID REFERENCES item_reports(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://wdpduhwnkfsqmkhjppsq.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
VITE_GROQ_API_KEY=YOUR_GROQ_API_KEY
```

---

## 🚀 Quickstart & Installation

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js leaflet react-leaflet string-similarity
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 📐 Non-Conflicting Architecture & Design Synergy

This repository combines:
- **Design Layer**: WebGL visual polish (`Grainient` shader, customized translucent glass floating navbar, color palette picker) built by the design team.
- **Functional Layer**: Supabase DB integration, Leaflet interactive campus mapping, AI image tagging, role-based workflows, and automated item matching engine.
