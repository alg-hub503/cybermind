import { prisma } from "@/lib/prisma";
import { UpdateSchoolSettingsDto } from "../types/school-settings";

export class PrismaSchoolSettingsRepository {
  findBySchoolId(schoolId: string) {
    return prisma.schoolSettings.findUnique({
      where: { schoolId },
    });
  }

  findOrCreateBySchoolId(schoolId: string) {
    return prisma.schoolSettings.upsert({
      where: { schoolId },
      update: {},
      create: { schoolId },
    });
  }

  update(schoolId: string, data: UpdateSchoolSettingsDto) {
    return prisma.schoolSettings.update({
      where: { schoolId },
      data,
    });
  }
}
