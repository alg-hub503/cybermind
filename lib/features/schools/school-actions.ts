import { SchoolService } from "@/lib/features/schools/services/school-service";

const service = new SchoolService();

export const getSchools = () => service.getAll();
export const getSchool = (id: string) => service.getById(id);
export const createSchool = (data: Parameters<SchoolService["create"]>[0]) => service.create(data);
export const updateSchool = (id: string, data: Parameters<SchoolService["update"]>[1]) => service.update(id, data);
export const deleteSchool = (id: string) => service.delete(id);
