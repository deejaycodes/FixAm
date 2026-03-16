import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { sequelize } from './models';
import { adminAuth } from './middleware/auth';

import webhookRoutes from './routes/webhook';
import authRoutes from './routes/auth';
import artisanRoutes from './routes/artisans';
import requestRoutes from './routes/requests';
import paymentRoutes from './routes/payments';
import analyticsRoutes from './routes/analytics';
import profileRoutes from './routes/profile';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ADMIN_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Paystack webhook needs raw body — mount before express.json()
app.use('/api/payments/webhook', paymentRoutes);

app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/webhook', webhookRoutes);
app.use('/api/auth', authRoutes);
app.use('/p', profileRoutes); // public — no auth
app.use('/api/artisans', adminAuth, artisanRoutes);
app.use('/api/requests', adminAuth, requestRoutes);
app.use('/api/payments', adminAuth, paymentRoutes);
app.use('/api/analytics', adminAuth, analyticsRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Start
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');
    app.listen(PORT, () => console.log(`🚀 FixAm API running on port ${PORT}`));
  } catch (err: any) {
    console.error('❌ Startup failed:', err.message);
    console.log('💡 Server starting without database (set DATABASE_URL in .env)');
    app.listen(PORT, () => console.log(`🚀 FixAm API running on port ${PORT} (no DB)`));
  }
}

start();
