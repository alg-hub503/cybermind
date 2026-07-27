import { AcademicYearService } from "./services/academic-year-service";

const service = new AcademicYearService();

export const getAcademicYears = () => service.getAll();
export const getAcademicYear = (id: string) => service.getById(id);
export const getAcademicYearsBySchool = (schoolId: string) => service.getBySchool(schoolId);
export const createAcademicYear = (data: Parameters<AcademicYearService["create"]>[0]) => service.create(data);
export const updateAcademicYear = (id: string, data: Parameters<AcademicYearService["update"]>[1]) => service.update(id, data);
export const deleteAcademicYear = (id: string) => service.delete(id);
