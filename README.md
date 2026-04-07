# 🫀 PulsePo!int — Neural Health Intelligence Ecosystem

PulsePo!int is a high-fidelity, AI-orchestrated clinical intelligence platform designed to synchronize biological data into a unified, interactive medical dashboard. Built with a "Neural-First" philosophy, it combines WebGL-accelerated mapping, real-time symptom analysis, and Clerk-secured identity management.

## 🚀 Clinical Architecture
- **Frontend:** Next.js (App Router), Framer Motion, Three.js, Lucide, MapLibre GL.
- **Backend:** Node.js, Express, MongoDB (Mongoose), Clerk Backend SDK.
- **Intelligence Layer:** Groq (Qwen 3-32B), Google Gemini 2.0.
- **Security:** Clerk Neural Identity Hub + Edge Route Middleware.

## 🛠️ Deployment Registry

### [1] Backend Deployment (Render/Heroku/AWS)
Set the following environment variables in your provider's dashboard:
| Key | Purpose |
| :--- | :--- |
| `MONGODB_URI` | Neural Database Connection String (Atlas recommended) |
| `CLERK_SECRET_KEY` | Managed identity master key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Identity hub public key |
| `GROQ_API_KEY` | Symptom Analysis Engine (Qwen) |
| `GEMINI_API_KEY` | Document Analysis & OCR Engine |
| `FRONTEND_URL` | Your Vercel production URL (e.g., `https://pulsepoint.vercel.app`) |
| `PORT` | Set automatically by Render (fallback 3001) |

### [2] Frontend Deployment (Vercel)
Set the following environment variables in the Vercel project settings:
| Key | Purpose |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Your Render production API endpoint (e.g., `https://api.pulsepoint.com/api`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public identity key (Sync with Backend) |
| `CLERK_SECRET_KEY` | Master identity key (Sync with Backend) |

## 🏗️ Local Neural Core Setup
1. **Synchronize Dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. **Initialize Environments:** Create `.env` in `backend/` and `.env.local` in `frontend/` using the keys above.
3. **Launch Ecosystem:**
   ```bash
   # Terminal 1 (Neural Core)
   cd backend && npm run dev
   # Terminal 2 (Identity Portal)
   cd frontend && npm run dev
   ```

---
**PulsePo!int: Living for Longevity. 🔐🧪📸🏽‍⚕️**
