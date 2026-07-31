# 🔍 Lost & Found System with Grainient (React Bits)

A modern, community-driven **Lost and Found System** built with **React**, **Vite**, and **WebGL 2.0 (`ogl`)** featuring procedural grainy gradient motion backgrounds (`<Grainient />` from React Bits).

---

## ✨ Features

- **Procedural WebGL Background**: Powered by the `<Grainient />` component from React Bits (`ogl` library).
- **Interactive Palette Customizer**: Real-time color pickers for `Color 1` (`#a3f2ff`), `Color 2` (`#ffffff`), and `Color 3` (`#f3ef96`).
- **Pill Navigation**: Sleek, floating translucent header navigation bar.
- **Search & Category Filters**: Search through reported items (Electronics, Personal Items, Keys, Pets) with instant keyword filtering.
- **Report Item Modal**: Community members can publish lost or found item reports with location and contact details.
- **Demo Content Toggle**: Interactive toggle switch to view or hide sample items.

---

## 🎨 Color Palette Reference

- **Color 1**: `#a3f2ff` (Cyan / Light Blue)
- **Color 2**: `#ffffff` (Pure White)
- **Color 3**: `#f3ef96` (Pastel Yellow)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure Node.js (v18+) is installed on your machine.

### 2. Installation
```bash
npm install
```

### 3. Running Locally
```bash
# On Windows PowerShell:
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm run dev

# On Command Prompt (CMD):
set PATH=C:\Program Files\nodejs;%PATH%
npm run dev
```

### 4. Production Build
```bash
npm run build
```

---

## 🧩 Grainient Component Usage Example

```jsx
import Grainient from './components/Grainient/Grainient';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Grainient
    color1="#a3f2ff"
    color2="#ffffff"
    color3="#f3ef96"
    timeSpeed={0.25}
    warpStrength={1.0}
    grainAmount={0.08}
    contrast={1.1}
    gamma={1.0}
    saturation={1.0}
    zoom={0.9}
  />
</div>
```

---

## 🔗 Context & References
- Shared Reference: https://claude.ai/share/853c5351-bdd5-4ba0-a2f3-9ba18fba844f
- React Bits Component Library: https://reactbits.dev
