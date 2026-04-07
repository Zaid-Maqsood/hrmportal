const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const rawUrl = process.env.DATABASE_URL || '';
const isProd = process.env.NODE_ENV === 'production' || rawUrl.includes('ondigitalocean.com');
// Strip Prisma-specific params (schema) and pg-incompatible params (sslmode) from the URL.
// The shared DO DB has multiple schemas with User tables — wrong schema = wrong password hash.
const connectionString = rawUrl
  .replace(/([?&])sslmode=[^&]*/g, '$1')
  .replace(/([?&])schema=[^&]*/g, '$1')
  .replace(/[?&]$/, '');

const pool = new Pool({
  connectionString,
  max: 5,
  ...(isProd && { ssl: { rejectUnauthorized: false } }),
});

// Force hrm schema on every new connection — shared DO DB has multiple schemas
// with User tables; wrong search_path = wrong password hash = 401 on login.
pool.on('connect', (client) => {
  client.query('SET search_path TO hrm');
});

const adapter = new PrismaPg(pool, { schema: 'hrm' });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
