# PulsePoint Backend — Setup & Run Guide

## Prerequisites
- **Node.js** v18+ 
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`
- **Ollama** running locally on `http://localhost:11434` (for local AI model inference)

## Quick Start

```bash
# 1. Navigate to backend directory
cd PulsePoint/backend

# 2. Install dependencies
npm install

# 3. Configure environment
# Copy .env.example to .env and fill in your API keys
cp .env.example .env

# 4. Start development server
npm run dev
```

The backend will start on `http://localhost:5000`.

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `GROQ_API_KEY` | Groq cloud inference API key |
| `MISTRAL_API_KEY` | Mistral cloud API key |
| `DEEPSEEK_API_KEY` | DeepSeek cloud API key |
| `OLLAMA_URL` | Local Ollama server URL |
| `OLLAMA_PRIMARY_MODEL` | Primary local model (`qwen3:30b`) |

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Protected | Get current user |
| GET | `/api/profile` | Protected | Get user profile |
| POST | `/api/profile` | Protected | Create/update profile |
| GET | `/api/dashboard` | Protected | Dashboard data |
| POST | `/api/symptoms/analyze` | Protected | AI symptom analysis |
| POST | `/api/medicine/check` | Protected | Medicine compatibility |
| POST | `/api/chat/message` | Protected | AI Doctor chat |
| POST | `/api/reports/analyze` | Protected | Report OCR + analysis |
| POST | `/api/emergency/trigger` | Protected | Emergency SOS |
| GET | `/api/notifications` | Protected | Get notifications |
| PUT | `/api/notifications/read` | Protected | Mark read |
| GET | `/api/news` | Protected | Health news feed |

## AI Model Routing

| Feature | Primary | Secondary | Fallback |
|---|---|---|---|
| Symptoms | Qwen 30b (Local) | Mistral (Cloud) | Groq |
| Medicine | Rules Engine | Qwen/Mistral | DeepSeek |
| AI Doctor | Qwen (Local) | Groq (Fast) | Mistral |
| Reports | Mistral OCR | LLaVA (Vision) | Qwen |
| Dashboard | Groq (Fast) | Qwen (Local) | — |

## Frontend Connection

The frontend connects via `src/lib/api.ts` which automatically:
- Attaches JWT Bearer tokens from `localStorage`
- Targets `http://localhost:5000/api` by default
- Handles JSON parsing and error propagation
