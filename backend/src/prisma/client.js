const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const rawUrl = process.env.DATABASE_URL || '';
const isProduction = rawUrl.includes('ondigitalocean.com');
// Strip sslmode from URL — pg lib treats sslmode=require as verify-full in newer versions,
// which breaks with DO's self-signed cert chain. SSL is handled via the ssl option below.
const connectionString = rawUrl.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '');
const pool = new Pool({
  connectionString,
  ...(isProduction && { ssl: { rejectUnauthorized: false } }),
});

const adapter = new PrismaPg(pool, { schema: 'hrm' });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
