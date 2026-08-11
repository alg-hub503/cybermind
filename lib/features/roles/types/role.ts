export interface Role {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDto {
  name: string;
  description?: string | null;
  permissionIds?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string | null;
  permissionIds?: string[];
}
