import { PrismaSchoolSettingsRepository } from "../repositories/prisma-school-settings-repository";
import { UpdateSchoolSettingsDto } from "../types/school-settings";

export class SchoolSettingsService {
  private repository = new PrismaSchoolSettingsRepository();

  getBySchoolId(schoolId: string) {
    return this.repository.findOrCreateBySchoolId(schoolId);
  }

  update(schoolId: string, data: UpdateSchoolSettingsDto) {
    return this.repository.update(schoolId, data);
  }
}
