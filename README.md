<div align="center">

  <h1>🫀 PulsePo!int</h1>
  <h3>— Neural Health Intelligence Ecosystem —</h3>

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Clerk](https://img.shields.io/badge/Clerk-Neural_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Clinical_Registry-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Tailwind](https://img.shields.io/badge/Tailwind-Neural_Night-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

  <p align="center">
    <b>PulsePo!int</b> is a premium clinical intelligence architecture designed to synchronize internal biological signatures into a high-fidelity, interactive dashboard. Built with a <b>"Neural-First"</b> design system, it delivers real-time mapping, AI-symptom triage, and secure identity orchestration.
  </p>

  [**Explore Live Hub**](#-clinical-architecture) | [**Deploy Manifest**](#-neural-setup) | [**Technical Briefing**](#-identity-handshake)

</div>

---

## 🏛️ Clinical Architecture

<div align="center">
  <img src="docs/assets/actual_hero.png" width="90%" style="border-radius: 12px; border: 1px solid rgba(225, 29, 72, 0.3);" alt="PulsePoint Authentic Hero" />
</div>

### 🧬 Integrated Intelligence
The PulsePo!int ecosystem is composed of four primary intelligence nodes, each synchronized via our **Neural Middleware**:

1.  **Medical Mapping Node** — Real-time clinician-grade markers leveraging WebGL.
2.  **Symptom Intelligence** — AI-driven triage via Groq (Qwen 3-32B).
3.  **Medicine Synchronization** — Reactive cabinet tracking with neural-pulse scheduling.
4.  **Neural Identity Hub** — Clerk-powered biometric synchronization at the Edge.

---

## 📸 Neural Interface Hub

<div align="center">
  <img src="docs/assets/actual_home.png" width="90%" style="border-radius: 12px; margin-bottom: 20px;" alt="Neural Dashboard Home" />
  
  <p align="center">
    <b>Neural Intelligence Dashboard:</b> Real-time synchronization of environmental pulses and clinical briefing scores.
  </p>

  <br />

  <img src="docs/assets/actual_map.png" width="90%" style="border-radius: 12px; margin-bottom: 20px;" alt="Medical Map Interface" />

  <p align="center">
    <b>Medical Intelligence Map:</b> High-density marker clustering for regional clinical trend analysis.
  </p>
</div>

---

## 🔐 Identity Handshake

<div align="center">
  <img src="docs/assets/actual_login.png" width="90%" style="border-radius: 12px; border: 1px solid rgba(225, 29, 72, 0.2);" alt="Clerk Identity Portal" />
</div>

PulsePo!int utilizes a **Zero-Persistence Local State** combined with **Clerk Identity Hub** for maximum clinical security. Every pulse is verified at the Edge before reaching the Neural Core.

```typescript
// PulsePoint Global Middleware Orchestration
export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect(); // Synchronize Neural Lock
  }
});
```

---

## 🏗️ Neural Setup

Configure your local environment to establish the clinical link:

### [1] Backend Synchronization
| Secret Key | Clinical Purpose |
| :--- | :--- |
| `MONGODB_URI` | Central Neural Registry |
| `CLERK_SECRET_KEY` | Identity Orchestration Master |
| `GROQ_API_KEY` | Internal Symptom Triaging Engine |
| `GEMINI_API_KEY` | Forensic Document Analysis |

### [2] Deployment Protocol
1.  **Initialize Registry:** `npm install` (Root Workspace)
2.  **Synchronize Core:** `cd backend && npm run dev`
3.  **Initialize Portal:** `cd frontend && npm run dev`

---

<div align="center">
  <p><b>Clinical Excellence — PulsePo!int Neural Health Intelligence. 🔐🧪📸🏽‍⚕️</b></p>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=primary&height=60&section=footer" width="100%" />
</div>
