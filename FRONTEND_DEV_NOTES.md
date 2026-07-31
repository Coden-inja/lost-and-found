# 📝 Developer Handover Note for Frontend Teammate

Hi! 👋 Everything for the **Smart Campus Lost & Found System** (HIT Kolkata) is fully built, integrated, tested, and ready.

---

## 🎨 1. Your Visual Design is 100% Preserved
All of your original UI components and styles remain completely untouched:
- **WebGL `<Grainient />` Shader & Live Palette Customizer** (`#a3f2ff`, `#ffffff`, `#f3ef96`)
- **Sticky Floating Pill Navbar & Header**
- **Hero Section & Live Campus Stats** (`94% Items Reunited`, `1,420+ Verified Claims`, `< 2 hrs Average Return Time`)
- **Item Cards Grid** with your exact card header gradients (`card-header-gradient`), `status-pill`, `tag-pill`, and `category-badge`
- **Campus Security Desks Grid & Claim Guidelines**
- **Footer**

---

## ⚡ 2. Functional Additions Integrated into Your Layout

We attached all Part B hackathon backend and AI features seamlessly into your existing UI structure:

| Feature | Description | File Location |
|---|---|---|
| **Role Switcher** | Added a toggle button in the floating header (`Student` vs `Admin`). | `src/App.jsx` (Navbar) |
| **Supabase Database** | Real-time connection querying & inserting against `item_reports` table. | `src/lib/supabase.js` |
| **AI Photo Auto-Tagging** | Uploading a photo in the report modal calls Gemini API (with **Groq API fallback** using `llama-3.3-70b-versatile`) to extract `#keywords` automatically. Non-blocking. | `src/lib/gemini.js` |
| **Smart Matching Engine** | Synchronous algorithm in pure JS calculating match score % based on `string-similarity` (Dice's Coefficient) + category + zone + hardcoded synonym dictionary (`phone ↔ smartphone`, `bag ↔ backpack`, etc.). Scores **≥ 50%** set status to `match_suggested`. | `src/lib/matching.js` |
| **Leaflet Campus Map** | Interactive map centered on HIT Kolkata (`22.5185, 88.4163`) with zone markers. | `src/components/CampusMap.jsx` |
| **Admin Claim Verification** | In `Admin` mode, viewing an item detail unlocks secret verification details + action buttons (`Approve Match`, `Reject`, `Mark Resolved`). | `src/App.jsx` (Item Detail Modal) |

---

## 🧪 3. How to Run & Test

### **A. Run Development Server**
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm run dev
```

### **B. Run Automated API & Flow Test Scripts**
We created 2 automated test scripts in the `scripts/` directory:

1. **Service Health Check** (Tests Server, Supabase DB, Gemini, & Groq):
   ```cmd
   node scripts/test_curl_apis.js
   ```

2. **Full End-to-End Student & Admin User Flow Simulation**:
   ```cmd
   node scripts/test_user_flow.js
   ```

---

## ⚙️ 4. Environment Variables (`.env`)

The credentials for Supabase, Gemini, and Groq are saved in `.env`:

```env
VITE_SUPABASE_URL=https://wdpduhwnkfsqmkhjppsq.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
VITE_GROQ_API_KEY=YOUR_GROQ_API_KEY
```

Everything is verified, compiled cleanly (`npm run build` in 424ms), and ready for demo! 🚀
