export interface Student {
  id: string;
  schoolId: string;
  code: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  enrolledAt: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudentDto {
  schoolId: string;
  code: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
}

export interface UpdateStudentDto {
  code?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  status?: string;
}

export interface StudentWithDetails {
  id: string;
  schoolId: string;
  code: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  status: string;
  academicHistory: Array<{
    academicYear: { id: string; name: string };
    class: { id: string; name: string };
    enrolledAt: Date;
  }>;
}
