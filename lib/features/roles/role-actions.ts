import { RoleService } from "./services/role-service";

const service = new RoleService();

export const getRoles = () => service.getAll();
export const getRolesBySchoolId = (schoolId: string) => service.getBySchoolId(schoolId);
export const getRole = (id: string) => service.getById(id);
export const getRoleByName = (name: string, schoolId: string) => service.getByName(name, schoolId);
export const createRole = (data: Parameters<RoleService["create"]>[0]) => service.create(data);
export const updateRole = (id: string, data: Parameters<RoleService["update"]>[1]) => service.update(id, data);
export const deleteRole = (id: string) => service.delete(id);
