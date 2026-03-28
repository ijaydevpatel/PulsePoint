# PulsePoint Project Structure

```text
PulsePoint/
├── backend/                # Express.js API & AI Orchestration
│   ├── src/
│   │   ├── ai-services/    # Ollama integration (ollamaService.js)
│   │   ├── controllers/    # Request handlers (chat, symptoms, medicine)
│   │   ├── model-router/   # AI routing logic (orchestrator.js)
│   │   ├── routes/         # API Endpoint definitions
│   │   └── utils/          # Shared utilities
│   ├── .env                # Model configurations & environment variables
│   ├── package.json
│   └── server.js           # Entry point
│
├── frontend/               # Next.js (React) Dashboard
│   ├── src/
│   │   ├── app/            # App Router (Pages & Layouts)
│   │   │   ├── dashboard/  # Secured AI interaction tabs
│   │   │   │   ├── chat/
│   │   │   │   ├── medicine/
│   │   │   │   └── symptoms/
│   │   │   └── globals.css  # Global Tailwind & Design System tokens
│   │   ├── components/     # Reusable UI components
│   │   └── lib/            # Shared libraries (api.ts)
│   ├── next.config.js
│   └── package.json
│
├── .gemini/                # AI Agent cache & brain
├── project_structure.txt   # Detailed file-level tree (Auto-generated)
└── STRUCTURE.md            # This visual map
```
