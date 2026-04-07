const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const rawUrl = process.env.DATABASE_URL || '';
const isProd = process.env.NODE_ENV === 'production' || rawUrl.includes('ondigitalocean.com');
// Strip sslmode — pg v8 treats sslmode=require as verify-full, breaking DO's self-signed cert.
const connectionString = rawUrl.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '');

const pool = new Pool({
  connectionString,
  ...(isProd && { ssl: { rejectUnauthorized: false } }),
});

const adapter = new PrismaPg(pool, { schema: 'hrm' });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
