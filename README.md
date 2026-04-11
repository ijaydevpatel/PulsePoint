<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:202020,100:0055FF&height=250&section=header&text=PulsePo%21int&fontSize=80&fontAlignY=35&fontColor=ffffff" width="100%" />

**Next-Generation Clinical Intelligence & Neural Diagnostics Platform**
<br/>
*Bridging the gap between advanced medical AI and state-of-the-art interface design.*

🔗 **[pulsepoiint.vercel.app](https://pulsepoiint.vercel.app/)**

<br/>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
<br/>
![Clerk](https://img.shields.io/badge/Clerk%20Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-f55036?style=for-the-badge&logo=data:image/svg%2Bxml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+R3JvcTwvdGl0bGU+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xNC41IDJINWwtMyAxMWg2LjVMNiAyMmwxNC0xM2gtNy41bDItN3oiLz48L3N2Zz4=)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-222?style=for-the-badge&logo=framer&logoColor=0055FF)
<br/>
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

</div>

---

<br/>

> **PulsePo!int** is not just another medical application; it's a meticulously crafted intelligence platform. It strictly adheres to a "Clinical Aesthetic" design language—leveraging pristine glassmorphism, responsive 3D data visualization, and zero-latency real-time neural diagnostics to provide an unmatched, premium health triage experience.

<br/>

## ✨ Core Platform Functionality

This application provides the following end-to-end medical features for users:

<table align="center" width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">🩺 Symptoms Analyzer</h3>
      <p align="center">Input your physical symptoms to instantly receive an AI-driven, 1-100% severity triage breakdown highlighting potential conditions.</p>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">⚕️ AI Chat Doctor</h3>
      <p align="center">Engage in continuous, real-time conversations with our Neural Consult AI to discuss health queries and receive guided medical intelligence.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">🗺️ Medical Map Tracker</h3>
      <p align="center">Interactive geographic routing and visualization to help locate nearby care facilities, pharmacies, and the most relevant local health hubs.</p>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">💊 Medicine & Treatment Guide</h3>
      <p align="center">Get preliminary insights on potential medications, actionable home care steps, and post-diagnostic guidance seamlessly integrated.</p>
    </td>
  </tr>
  <tr>
    <td colspan="2" valign="top">
      <h3 align="center">📑 Report Analyzer</h3>
      <p align="center">Upload your raw PDFs and sprawling medical records. Our system instantly parses, summarizes, and extracts critical health data.</p>
    </td>
  </tr>
</table>

<br/>

## 📐 The "Clinical Aesthetic" Design System

PulsePo!int refuses to settle for standard, uninspired components. The UI architecture is built entirely on a custom design system characterized by:

- 🪞 **Glassmorphism & Depth:** Theme-aware, frosted transparent overlays offering layered depth and a sterile, premium feel.
- 📱 **Dynamic Viewport Scaling:** Pixel-perfect mobile responsiveness utilizing dynamic viewport height (`100dvh`) and custom bottom docks to seamlessly bridge mobile and desktop experiences without layout cropping.
- 🌊 **Motion & Fluidity:** Driven by `framer-motion`, smooth scrolling via `lenis`, and `@react-three/fiber` / `@react-three/drei` for organic transitions, micro-interactions, and 3D medical visualizations.
- 📊 **Robust Reporting:** Clean, precision charting integrated via `Recharts`, exclusively keeping medical data legible, accessible, and instantly parsable.

---

## 🏗️ Technical Architecture & Services Used

### Front-End Services & Stack
> Hosted flawlessly on **Vercel** for edge-network performance.
- **Framework:** Next.js 16 (App Router) + React 19
- **Authentication:** Clerk (`@clerk/nextjs`, `@clerk/themes`)
- **Styling UI:** TailwindCSS v4 + Framer Motion + `clsx` & `tailwind-merge`
- **Mapping & Geographic:** Leaflet, React-Leaflet, MapLibre-GL, `@googlemaps/js-api-loader`
- **Data Vis & 3D Elements:** Recharts, React Three Fiber, React Three Drei, Three.js
- **Icons & Extras:** Lucide React, Lodash, Lenis

### Back-End Services & Providers
> Architected securely via **Render** for reliable containerized API serving.
- **Server:** Node.js + Express
- **Database:** MongoDB (Atlas) via Mongoose ORM
- **Intelligence Providers:** Google Generative AI (`@google/generative-ai`) and Groq API
- **Parsers & Web Extractors:** `pdf-parse`, `pdfjs-dist`, DOM scraping with `cheerio`, and `rss-parser`
- **Misc Tools:** `multer` limit/upload config, `nodemailer` capabilities, `bcryptjs`

---

## ⚙️ Environment Configuration (.env files)

To run the full stack locally, you need two separate environment files containing your service keys.

### 1. Backend (`backend/.env`)
Create a `.env` file in the root of the `backend` folder:

```env
PORT=3001
MONGODB_URI=your_mongodb_cluster_uri

# AI Service Keys
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

# Upload Config
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Auth Services
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 2. Frontend (`frontend/.env.local`)
Create a `.env.local` file in the root of the `frontend` folder:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Clerk Route Handlers
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/profile-setup

# API Binding
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🚀 Deployment & Initialization

Deploying the PulsePo!int workspace requires initializing both the orchestrated backend service and the frontend dashboard layer. 

### 1. Initialize the Neural Layer (Backend)
```bash
cd backend
npm install
npm run dev
```

### 2. Boot the Interface (Frontend)
```bash
cd frontend
npm install
npm run dev
```

<br/>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:202020,100:0055FF&height=100&section=footer" width="100%" />

---
<i>Engineered for health. Designed with absolute precision.</i>
<br><br>
<img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge" />

</div>
