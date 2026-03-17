import sequelize from '../config/database';
import { DataTypes, Model, Optional } from 'sequelize';
import crypto from 'crypto';

// ── Attribute interfaces ────────────────────────────────────────

interface CustomerAttributes {
  id: string;
  name: string | null;
  phone: string;
  whatsappId: string | null;
  location: { lat: number; lng: number } | null;
  referralCode: string;
  referredBy: string | null;
  discountUsed: boolean;
  subscriptionTier: 'free' | 'premium';
  subscriptionExpiresAt: Date | null;
}

interface ArtisanAttributes {
  id: string;
  name: string;
  phone: string;
  whatsappId: string | null;
  services: string[];
  location: { lat: number; lng: number } | null;
  rating: number;
  totalJobs: number;
  verified: boolean;
  available: boolean;
  ninVerified: boolean;
  referralCode: string;
  referredBy: string | null;
  priorityBoost: boolean;
  paystackSubaccount: string | null;
  profileSlug: string;
  bio: string | null;
  sharingLocation: boolean;
  liveLocation: { lat: number; lng: number } | null;
  portfolioPhotos: string[];
}

interface ServiceRequestAttributes {
  id: string;
  serviceType: 'plumbing' | 'electrical' | 'ac_repair' | 'generator' | 'carpentry';
  description: string | null;
  location: { lat: number; lng: number } | null;
  estimatedPrice: number | null;
  finalPrice: number | null;
  status: 'pending' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  rating: number | null;
  review: string | null;
  completedAt: Date | null;
  discount: number;
  photos: string[];
  guaranteeUsed: boolean;
  CustomerId: string | null;
  ArtisanId: string | null;
  scheduledAt: Date | null;
}

interface QuoteAttributes {
  id: string;
  price: number;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  ServiceRequestId: string;
  ArtisanId: string;
}

interface PaymentAttributes {
  id: string;
  amount: number;
  commission: number | null;
  paystackRef: string | null;
  status: 'pending' | 'paid' | 'failed';
  ServiceRequestId: string | null;
  createdAt?: Date;
}

interface MessageAttributes {
  id: string;
  text: string;
  sender: 'customer' | 'artisan';
  ServiceRequestId: string;
  createdAt?: Date;
}

interface AdminUserAttributes {
  id: string;
  email: string;
  password: string;
  name: string | null;
}

// ── Creation attributes (id auto-generated) ────────────────────

type CustomerCreation = Optional<CustomerAttributes, 'id' | 'name' | 'whatsappId' | 'location' | 'referralCode' | 'referredBy' | 'discountUsed' | 'subscriptionTier' | 'subscriptionExpiresAt'>;
type ArtisanCreation = Optional<ArtisanAttributes, 'id' | 'whatsappId' | 'location' | 'rating' | 'totalJobs' | 'verified' | 'available' | 'ninVerified' | 'referralCode' | 'referredBy' | 'priorityBoost' | 'paystackSubaccount' | 'profileSlug' | 'bio' | 'sharingLocation' | 'liveLocation' | 'portfolioPhotos'>;
type ServiceRequestCreation = Optional<ServiceRequestAttributes, 'id' | 'description' | 'location' | 'estimatedPrice' | 'finalPrice' | 'status' | 'rating' | 'review' | 'completedAt' | 'discount' | 'photos' | 'guaranteeUsed' | 'CustomerId' | 'ArtisanId' | 'scheduledAt'>;
type PaymentCreation = Optional<PaymentAttributes, 'id' | 'commission' | 'paystackRef' | 'status' | 'ServiceRequestId'>;
type AdminUserCreation = Optional<AdminUserAttributes, 'id' | 'name'>;
type QuoteCreation = Optional<QuoteAttributes, 'id' | 'message' | 'status'>;
type MessageCreation = Optional<MessageAttributes, 'id'>;

// ── Model classes ───────────────────────────────────────────────

class Customer extends Model<CustomerAttributes, CustomerCreation> implements CustomerAttributes {
  declare id: string;
  declare name: string | null;
  declare phone: string;
  declare whatsappId: string | null;
  declare location: { lat: number; lng: number } | null;
  declare referralCode: string;
  declare referredBy: string | null;
  declare discountUsed: boolean;
  declare subscriptionTier: 'free' | 'premium';
  declare subscriptionExpiresAt: Date | null;
}

class Artisan extends Model<ArtisanAttributes, ArtisanCreation> implements ArtisanAttributes {
  declare id: string;
  declare name: string;
  declare phone: string;
  declare whatsappId: string | null;
  declare services: string[];
  declare location: { lat: number; lng: number } | null;
  declare rating: number;
  declare totalJobs: number;
  declare verified: boolean;
  declare available: boolean;
  declare ninVerified: boolean;
  declare referralCode: string;
  declare referredBy: string | null;
  declare priorityBoost: boolean;
  declare paystackSubaccount: string | null;
  declare profileSlug: string;
  declare bio: string | null;
  declare sharingLocation: boolean;
  declare liveLocation: { lat: number; lng: number } | null;
  declare portfolioPhotos: string[];
}

class ServiceRequest extends Model<ServiceRequestAttributes, ServiceRequestCreation> implements ServiceRequestAttributes {
  declare id: string;
  declare serviceType: 'plumbing' | 'electrical' | 'ac_repair' | 'generator' | 'carpentry';
  declare description: string | null;
  declare location: { lat: number; lng: number } | null;
  declare estimatedPrice: number | null;
  declare finalPrice: number | null;
  declare status: 'pending' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  declare rating: number | null;
  declare review: string | null;
  declare completedAt: Date | null;
  declare discount: number;
  declare photos: string[];
  declare guaranteeUsed: boolean;
  declare CustomerId: string | null;
  declare ArtisanId: string | null;
  declare scheduledAt: Date | null;
  declare Customer?: Customer;
  declare Artisan?: Artisan;
  declare Quotes?: Quote[];
}

class Quote extends Model<QuoteAttributes, QuoteCreation> implements QuoteAttributes {
  declare id: string;
  declare price: number;
  declare message: string | null;
  declare status: 'pending' | 'accepted' | 'rejected';
  declare ServiceRequestId: string;
  declare ArtisanId: string;
  declare Artisan?: Artisan;
}

class Payment extends Model<PaymentAttributes, PaymentCreation> implements PaymentAttributes {
  declare id: string;
  declare amount: number;
  declare commission: number | null;
  declare paystackRef: string | null;
  declare status: 'pending' | 'paid' | 'failed';
  declare ServiceRequestId: string | null;
}

class Message extends Model<MessageAttributes, MessageCreation> implements MessageAttributes {
  declare id: string;
  declare text: string;
  declare sender: 'customer' | 'artisan';
  declare ServiceRequestId: string;
  declare createdAt?: Date;
}

class AdminUser extends Model<AdminUserAttributes, AdminUserCreation> implements AdminUserAttributes {
  declare id: string;
  declare email: string;
  declare password: string;
  declare name: string | null;
}

// ── Init models ─────────────────────────────────────────────────

Customer.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING, allowNull: false, unique: true },
  whatsappId: { type: DataTypes.STRING, unique: true },
  location: { type: DataTypes.JSONB },
  referralCode: { type: DataTypes.STRING, unique: true, defaultValue: () => 'FX' + crypto.randomBytes(3).toString('hex').toUpperCase() },
  referredBy: { type: DataTypes.UUID },
  discountUsed: { type: DataTypes.BOOLEAN, defaultValue: false },
  subscriptionTier: { type: DataTypes.ENUM('free', 'premium'), defaultValue: 'free' },
  subscriptionExpiresAt: { type: DataTypes.DATE },
}, { sequelize });

Artisan.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false, unique: true },
  whatsappId: { type: DataTypes.STRING, unique: true },
  services: { type: DataTypes.ARRAY(DataTypes.STRING) },
  location: { type: DataTypes.JSONB },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  totalJobs: { type: DataTypes.INTEGER, defaultValue: 0 },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  available: { type: DataTypes.BOOLEAN, defaultValue: true },
  ninVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  referralCode: { type: DataTypes.STRING, unique: true, defaultValue: () => 'FA' + crypto.randomBytes(3).toString('hex').toUpperCase() },
  referredBy: { type: DataTypes.UUID },
  priorityBoost: { type: DataTypes.BOOLEAN, defaultValue: false },
  paystackSubaccount: { type: DataTypes.STRING },
  profileSlug: { type: DataTypes.STRING, unique: true, defaultValue: () => crypto.randomBytes(4).toString('hex') },
  bio: { type: DataTypes.TEXT },
  sharingLocation: { type: DataTypes.BOOLEAN, defaultValue: false },
  liveLocation: { type: DataTypes.JSONB },
  portfolioPhotos: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
}, { sequelize });

ServiceRequest.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  serviceType: { type: DataTypes.ENUM('plumbing', 'electrical', 'ac_repair', 'generator', 'carpentry'), allowNull: false },
  description: { type: DataTypes.TEXT },
  location: { type: DataTypes.JSONB },
  estimatedPrice: { type: DataTypes.INTEGER },
  finalPrice: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('pending', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled'), defaultValue: 'pending' },
  rating: { type: DataTypes.INTEGER },
  review: { type: DataTypes.TEXT },
  completedAt: { type: DataTypes.DATE },
  discount: { type: DataTypes.INTEGER, defaultValue: 0 },
  photos: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  guaranteeUsed: { type: DataTypes.BOOLEAN, defaultValue: false },
  CustomerId: { type: DataTypes.UUID },
  ArtisanId: { type: DataTypes.UUID },
  scheduledAt: { type: DataTypes.DATE },
}, { sequelize });

Payment.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  commission: { type: DataTypes.INTEGER },
  paystackRef: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('pending', 'paid', 'failed'), defaultValue: 'pending' },
  ServiceRequestId: { type: DataTypes.UUID },
}, { sequelize });

AdminUser.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING },
}, { sequelize });

Quote.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  price: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected'), defaultValue: 'pending' },
  ServiceRequestId: { type: DataTypes.UUID, allowNull: false },
  ArtisanId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize });

Message.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  text: { type: DataTypes.TEXT, allowNull: false },
  sender: { type: DataTypes.ENUM('customer', 'artisan'), allowNull: false },
  ServiceRequestId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize });

// ── Relationships ───────────────────────────────────────────────

Customer.hasMany(ServiceRequest);
ServiceRequest.belongsTo(Customer);
Artisan.hasMany(ServiceRequest);
ServiceRequest.belongsTo(Artisan);
ServiceRequest.hasOne(Payment);
Payment.belongsTo(ServiceRequest);
ServiceRequest.hasMany(Quote);
Quote.belongsTo(ServiceRequest);
Artisan.hasMany(Quote);
Quote.belongsTo(Artisan);
ServiceRequest.hasMany(Message);
Message.belongsTo(ServiceRequest);

export { sequelize, Customer, Artisan, ServiceRequest, Payment, AdminUser, Quote, Message };
export type { CustomerAttributes, ArtisanAttributes, ServiceRequestAttributes, PaymentAttributes, AdminUserAttributes, QuoteAttributes, MessageAttributes };
