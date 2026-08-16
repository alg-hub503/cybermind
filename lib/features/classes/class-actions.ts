import { ClassService } from "./services/class-service";

const service = new ClassService();

export const getClasses = () => service.getAll();
export const getClass = (id: string) => service.getById(id);
export const getClassesBySchool = (schoolId: string) => service.getBySchool(schoolId);
export const getClassesByGrade = (gradeId: string) => service.getByGrade(gradeId);
export const createClass = (data: Parameters<ClassService["create"]>[0]) => service.create(data);
export const updateClass = (id: string, data: Parameters<ClassService["update"]>[1]) => service.update(id, data);
export const deleteClass = (id: string) => service.delete(id);
export const getClassWithDetails = (id: string) => service.getByIdWithDetails(id);
