const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const rawUrl = process.env.DATABASE_URL || '';
const isProd = process.env.NODE_ENV === 'production' || rawUrl.includes('ondigitalocean.com');
// Strip Prisma-specific (schema) and pg-incompatible (sslmode) params, then
// embed search_path via PostgreSQL's options param to lock every connection to hrm.
const cleaned = rawUrl
  .replace(/([?&])sslmode=[^&]*/g, '$1')
  .replace(/([?&])schema=[^&]*/g, '$1')
  .replace(/[?&]$/, '');
const sep = cleaned.includes('?') ? '&' : '?';
const connectionString = `${cleaned}${sep}options=-c+search_path%3Dhrm`;

const pool = new Pool({
  connectionString,
  max: 1,
  ...(isProd && { ssl: { rejectUnauthorized: false } }),
});

const adapter = new PrismaPg(pool, { schema: 'hrm' });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
