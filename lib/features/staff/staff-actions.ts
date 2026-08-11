import { StaffService } from "./services/staff-service";

const service = new StaffService();

export const getStaff = () => service.getAll();
export const getStaffMember = (id: string) => service.getById(id);
export const getStaffBySchool = (schoolId: string) => service.getBySchool(schoolId);
export const getStaffByUserId = (userId: string) => service.getByUserId(userId);
export const createStaffMember = (data: Parameters<StaffService["create"]>[0]) => service.create(data);
export const updateStaffMember = (id: string, data: Parameters<StaffService["update"]>[1]) => service.update(id, data);
export const deleteStaffMember = (id: string) => service.delete(id);
