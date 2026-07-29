import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
try {
  const u = await p.user.findFirst();
  console.log("DB OK:", u?.email ?? "no users");
} catch (e) {
  console.error("DB ERROR:", e.message);
} finally {
  await p.$disconnect();
}
