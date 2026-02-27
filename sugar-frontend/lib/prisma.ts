import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // 1. Create a connection pool using your DATABASE_URL
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // 2. Create the Adapter
  const adapter = new PrismaPg(pool);
  
  // 3. Pass the adapter to the Prisma Client
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;