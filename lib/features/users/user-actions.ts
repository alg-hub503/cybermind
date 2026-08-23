import { UserService } from "@/lib/features/users/services/user-service";

const service = new UserService();

export const getUsersBySchool = (schoolId: string) => service.getBySchool(schoolId);
export const getUserById = (id: string) => service.getById(id);
export const countUsersBySchool = (schoolId: string) => service.countBySchool(schoolId);
