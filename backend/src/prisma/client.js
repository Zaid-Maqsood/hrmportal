const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const isProduction = (process.env.DATABASE_URL || '').includes('ondigitalocean.com');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isProduction && { ssl: { rejectUnauthorized: false } }),
});

const adapter = new PrismaPg(pool, { schema: 'hrm' });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
