import { Sequelize } from 'sequelize';

const DATABASE_URL = process.env.DATABASE_URL;

const sequelize = new Sequelize(DATABASE_URL || 'postgres://localhost:5432/fixam', {
  dialect: 'postgres',
  logging: false,
  ...(process.env.NODE_ENV === 'production' && {
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  }),
});

export default sequelize;
