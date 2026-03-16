import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { sequelize, Customer, Artisan, ServiceRequest, Payment, AdminUser } from './src/models';

const ARTISANS = [
  { name: 'Chidi Okafor', phone: '2348101234567', services: ['plumbing', 'carpentry'], location: { lat: 6.5244, lng: 3.3792 }, rating: 4.8, totalJobs: 42, verified: true, available: true },
  { name: 'Amina Bello', phone: '2348102345678', services: ['electrical'], location: { lat: 6.5955, lng: 3.3421 }, rating: 4.6, totalJobs: 31, verified: true, available: true },
  { name: 'Emeka Nwosu', phone: '2348103456789', services: ['generator', 'electrical'], location: { lat: 6.4541, lng: 3.4218 }, rating: 4.9, totalJobs: 67, verified: true, available: true },
  { name: 'Fatima Yusuf', phone: '2348104567890', services: ['ac_repair'], location: { lat: 6.4698, lng: 3.5852 }, rating: 4.3, totalJobs: 18, verified: true, available: false },
  { name: 'Tunde Adeyemi', phone: '2348105678901', services: ['plumbing'], location: { lat: 6.6018, lng: 3.3515 }, rating: 4.5, totalJobs: 25, verified: false, available: true },
];

const CUSTOMERS = [
  { name: 'Ngozi Eze', phone: '2348201234567', location: { lat: 6.5100, lng: 3.3700 } },
  { name: 'Ibrahim Musa', phone: '2348202345678', location: { lat: 6.5800, lng: 3.3500 } },
];

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  console.log('🗑️  Database reset');

  const artisans = await Artisan.bulkCreate(ARTISANS as any[]);
  console.log(`👷 ${artisans.length} artisans created`);

  const customers = await Customer.bulkCreate(CUSTOMERS as any[]);
  console.log(`👤 ${customers.length} customers created`);

  const r1 = await ServiceRequest.create({
    serviceType: 'plumbing', description: 'Kitchen sink leaking badly',
    location: { lat: 6.51, lng: 3.37 }, estimatedPrice: 1000000,
    status: 'completed', completedAt: new Date(), rating: 5,
    CustomerId: customers[0].id, ArtisanId: artisans[0].id,
  });
  await ServiceRequest.create({
    serviceType: 'electrical', description: 'Power outlet sparking in bedroom',
    location: { lat: 6.58, lng: 3.35 }, estimatedPrice: 800000,
    status: 'assigned',
    CustomerId: customers[1].id, ArtisanId: artisans[1].id,
  });
  await ServiceRequest.create({
    serviceType: 'generator', description: 'Generator not starting',
    location: { lat: 6.45, lng: 3.42 }, estimatedPrice: 1500000,
    status: 'pending',
    CustomerId: customers[0].id,
  });
  console.log('📋 3 service requests created');

  await Payment.create({ amount: 1000000, commission: 150000, status: 'paid', paystackRef: 'fixam_seed_001', ServiceRequestId: r1.id });
  console.log('💳 1 payment created');

  const hashed = await bcrypt.hash('admin123', 10);
  await AdminUser.create({ email: 'admin@fixam.ng', password: hashed, name: 'Admin' });
  console.log('🔐 Admin user created (admin@fixam.ng / admin123)');

  console.log('\n✅ Seed complete!');
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
