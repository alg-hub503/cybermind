import { SubjectAssignmentService } from "./services/subject-assignment-service";

const service = new SubjectAssignmentService();

export const getSubjectAssignmentsBySchool = (schoolId: string) => service.getBySchool(schoolId);
export const getSubjectAssignmentsByClass = (classId: string) => service.getByClass(classId);
export const getSubjectAssignment = (id: string) => service.getById(id);
export const createSubjectAssignment = (data: Parameters<SubjectAssignmentService["create"]>[0]) => service.create(data);
export const deleteSubjectAssignment = (id: string) => service.delete(id);
