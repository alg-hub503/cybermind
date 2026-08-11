import { PermissionService } from "./services/permission-service";

const service = new PermissionService();

export const getPermissions = () => service.getAll();
export const getPermissionByCode = (code: string) => service.getByCode(code);
