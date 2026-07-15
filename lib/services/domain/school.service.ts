import { prisma } from "@/lib/prisma";

export async function getSchoolById(id: string) {
  return prisma.school.findUnique({
    where: {
      id,
    },
  });
}
