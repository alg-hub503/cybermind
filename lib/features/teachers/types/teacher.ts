export interface TeacherProfile {
  id: string;
  userId: string;
  schoolId: string;
  phone: string | null;
  specialization: string | null;
  qualifications: string | null;
  hireDate: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeacherDto {
  schoolId: string;
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  specialization?: string | null;
  qualifications?: string | null;
  hireDate?: string | null;
}

export interface UpdateTeacherDto {
  phone?: string | null;
  specialization?: string | null;
  qualifications?: string | null;
  hireDate?: string | null;
  status?: string;
}
