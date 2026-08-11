export interface StaffProfile {
  id: string;
  userId: string;
  schoolId: string;
  phone: string | null;
  position: string | null;
  department: string | null;
  hireDate: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStaffDto {
  schoolId: string;
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  hireDate?: string | null;
}

export interface UpdateStaffDto {
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  hireDate?: string | null;
  status?: string;
}
