# PulsePoint Backend — Setup & Run Guide

## Prerequisites
- **Node.js** v18+ 
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`

## Quick Start
```bash
# 1. Navigate to backend directory
cd PulsePoint/backend

# 2. Install dependencies
npm install

# 3. Configure environment
# Copy .env.example to .env and fill in GROQ_API_KEY and GEMINI_API_KEY
cp .env.example .env

# 4. Start development server
npm run dev
```

## AI Infrastructure
PulsePoint uses a standardized cloud-only neural architecture:

| Feature | Engine | Model ID |
|---|---|---|
| Symptoms | Groq | `qwen/qwen3-32b` |
| Medicine | Groq | `qwen/qwen3-32b` |
| AI Doctor | Groq | `qwen/qwen3-32b` |
| Reports | Gemini | `gemini-1.5-flash` |

## Environment Variables
- `GROQ_API_KEY`: API key for Groq Cloud.
- `GEMINI_API_KEY`: API key for Google Gemini.
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key for authentication.
