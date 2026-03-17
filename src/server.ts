import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { sequelize } from './models';

import webhookRoutes from './routes/webhook';
import authRoutes from './routes/auth';
import customerAuthRoutes from './routes/customerAuth';
import customerRequestRoutes from './routes/customerRequests';
import artisanRoutes from './routes/artisans';
import requestRoutes from './routes/requests';
import paymentRoutes from './routes/payments';
import analyticsRoutes from './routes/analytics';
import profileRoutes from './routes/profile';
import { adminAuth, customerAuth } from './middleware/auth';

const app = express();

// Middleware
app.use(helmet());
app.use(cors()); // Allow all origins for mobile app
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Paystack webhook needs raw body — mount before express.json()
app.use('/api/payments/webhook', paymentRoutes);

app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/webhook', webhookRoutes);
app.use('/api/auth', authRoutes);                          // admin auth
app.use('/api/customer', customerAuthRoutes);              // customer auth (no middleware)
app.use('/api/requests', customerAuth, customerRequestRoutes); // customer requests
app.use('/p', profileRoutes);                              // public — no auth
app.use('/api/admin/artisans', adminAuth, artisanRoutes);  // admin
app.use('/api/admin/requests', adminAuth, requestRoutes);  // admin
app.use('/api/payments', adminAuth, paymentRoutes);
app.use('/api/analytics', adminAuth, analyticsRoutes);

// Backward compat — keep old admin paths working
app.use('/api/artisans', adminAuth, artisanRoutes);


// Public: popular services (no auth)
app.get('/api/popular', async (_req, res) => {
  try {
    const { fn, col, Op } = require('sequelize');
    const { ServiceRequest } = require('./models');
    const popular = await ServiceRequest.findAll({
      attributes: ['serviceType', [fn('COUNT', col('id')), 'count']],
      where: { status: { [Op.ne]: 'cancelled' } },
      group: ['serviceType'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 3,
      raw: true,
    });
    res.json(popular);
  } catch { res.json([]); }
});

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
