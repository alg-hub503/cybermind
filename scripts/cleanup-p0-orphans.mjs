import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

(async () => {
  const ids = ["cms9730lz0000lkkx9q06b0zh", "cms9732cj0003lkkxvfxczfjy"];
  await p.invoice.deleteMany({ where: { schoolId: { in: ids } } });
  await p.client.deleteMany({ where: { schoolId: { in: ids } } });
  await p.school.deleteMany({ where: { id: { in: ids } } });
  console.log("orphans removed");
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
