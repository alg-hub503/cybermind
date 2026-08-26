export interface Role {
  id: string;
  name: string;
  systemKey: string | null;
  description: string | null;
  isDefault: boolean;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDto {
  name: string;
  description?: string | null;
  schoolId: string;
  permissionIds?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string | null;
  permissionIds?: string[];
}
