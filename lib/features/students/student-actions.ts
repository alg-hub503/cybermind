import { StudentService } from "./services/student-service";

const service = new StudentService();

export const getStudents = () => service.getAll();
export const getStudent = (id: string) => service.getById(id);
export const getStudentsBySchool = (schoolId: string) => service.getBySchool(schoolId);
export const getStudentByCode = (schoolId: string, code: string) => service.getByCode(schoolId, code);
export const createStudent = (data: Parameters<StudentService["create"]>[0]) => service.create(data);
export const updateStudent = (id: string, data: Parameters<StudentService["update"]>[1]) => service.update(id, data);
export const deleteStudent = (id: string) => service.delete(id);
