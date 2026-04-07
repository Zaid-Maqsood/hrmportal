import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: 'postgresql://postgres:zaid@localhost:5432/grayphite?schema=hrm',
  },
});
