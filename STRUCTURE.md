# PulsePoint Project Structure

```text
PulsePoint/
├── backend/                # Express.js API & AI Orchestration
│   ├── src/
│   │   ├── ai-services/    # Cloud AI Orchestration (Groq Qwen-3/Llama-3 & Gemini)
│   │   ├── controllers/    # Request handlers (chat, symptoms, medicine, intelligence)
│   │   ├── routes/         # API Endpoint definitions
│   │   ├── models/         # MongoDB Schemas (User, Profile, Health Records)
│   │   └── utils/          # Shared utilities and parsing logic
│   ├── .env                # Model configurations & environment variables
│   ├── package.json
│   └── server.js           # API Entry point (Port 3001)
│
├── frontend/               # Next.js (React) Dashboard (Turbopack)
│   ├── src/
│   │   ├── app/            # App Router (Pages & Layouts)
│   │   │   ├── dashboard/  # Secured AI interaction tabs
│   │   │   │   ├── chat/        # AI Doctor
│   │   │   │   ├── medicine/    # Medication Compatibility
│   │   │   │   ├── symptoms/    # Symptom Diagnosis Matrix
│   │   │   │   ├── briefing/    # Dedicated Intelligence Deep-Dive
│   │   │   │   ├── settings/    # Profile & Biometrics
│   │   │   │   ├── profile/     # User History
│   │   │   │   └── page.tsx     # Primary Executive Dashboard
│   │   │   └── globals.css      # Clinical Sentinel Design System
│   │   ├── context/        # React Context Providers (UserContext)
│   │   ├── components/     # Reusable Framer Motion UI components
│   │   └── lib/            # Shared libraries (api.ts - Port 3001 Sync)
│   ├── next.config.js
│   └── package.json
│
├── .gemini/                # AI Agent cache & brain
└── STRUCTURE.md            # This visual map
```
