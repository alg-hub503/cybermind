import { SchoolSettingsService } from "./services/school-settings-service";
import { UpdateSchoolSettingsDto } from "./types/school-settings";

const service = new SchoolSettingsService();

export const getSchoolSettings = (schoolId: string) =>
  service.getBySchoolId(schoolId);

export const updateSchoolSettings = (
  schoolId: string,
  data: UpdateSchoolSettingsDto
) => service.update(schoolId, data);
