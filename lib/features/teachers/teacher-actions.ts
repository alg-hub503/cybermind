import { TeacherService } from "./services/teacher-service";

const service = new TeacherService();

export const getTeachers = () => service.getAll();
export const getTeacher = (id: string) => service.getById(id);
export const getTeachersBySchool = (schoolId: string) => service.getBySchool(schoolId);
export const getTeacherByUserId = (userId: string) => service.getByUserId(userId);
export const createTeacher = (data: Parameters<TeacherService["create"]>[0]) => service.create(data);
export const updateTeacher = (id: string, data: Parameters<TeacherService["update"]>[1]) => service.update(id, data);
export const deleteTeacher = (id: string) => service.delete(id);
