import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
try {
  const tables = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name");
  console.log(JSON.stringify(tables, null, 2));
} finally {
  await prisma.$disconnect();
}
