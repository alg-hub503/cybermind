import { GradeService } from "./services/grade-service";

const service = new GradeService();

export const getGrades = () => service.getAll();
export const getGrade = (id: string) => service.getById(id);
export const getGradesBySchool = (schoolId: string) => service.getBySchool(schoolId);
export const createGrade = (data: Parameters<GradeService["create"]>[0]) => service.create(data);
export const updateGrade = (id: string, data: Parameters<GradeService["update"]>[1]) => service.update(id, data);
export const deleteGrade = (id: string) => service.delete(id);
