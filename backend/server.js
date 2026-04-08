import 'dotenv/config'; // Crucial: must be highest priority due to ES Module hoisting
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Imports API Routes
import profileRoutes from './src/routes/profile.js';
import dashboardRoutes from './src/routes/dashboard.js';
import reportRoutes from './src/routes/reports.js';
import symptomRoutes from './src/routes/symptomRoutes.js';
import medicineRoutes from './src/routes/medicineRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import newsRoutes from './src/routes/newsRoutes.js';
import diagnosticRoutes from './src/routes/diag.js'; // Helper for legacy SSE if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Production CORS Strategy: Neural Identity Handshake
const allowedOrigins = [
  'http://localhost:3000', 
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) or allowed domains
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked]: Attempted pulse from unauthorized domain: ${origin}`);
      callback(new Error('CORS identity mismatch'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
}));
app.options('*', cors()); // Handle preflight for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clinical API Layer Routing - Specific features first to prevent shadowing
app.use('/api/chat', chatRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/reports', reportRoutes);

// Generic Identity & Core Mounts
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', profileRoutes); // Root mount at target end

// Health Check Node
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Operational', 
    services: { 
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      auth: 'Clerk Identity Hub Enabled' 
    } 
  });
});

// Database Initialization & Server Activation
const startNeuralCore = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Neural Database Synchronized (Local MongoDB)');

    app.listen(PORT, () => {
      console.log(`🚀 PulsePoint Neural Core active at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Database Sync Collision:', err);
    process.exit(1); // Finalizing fault protocol
  }
};

startNeuralCore();
