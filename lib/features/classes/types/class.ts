export interface Class {
  id: string;
  schoolId: string;
  gradeId: string;
  academicYearId: string;
  name: string;
  code: string;
  createdAt: Date;
  grade?: { name: string };
  academicYear?: { name: string };
}

export interface CreateClassDto {
  schoolId: string;
  gradeId: string;
  academicYearId: string;
  name: string;
  code: string;
}

export interface UpdateClassDto {
  gradeId?: string;
  academicYearId?: string;
  name?: string;
  code?: string;
}

export interface ClassWithDetails {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  grade: { id: string; name: string };
  academicYear: { id: string; name: string };
  students: Array<{
    id: string;
    code: string;
    firstName: string;
    lastName: string;
  }>;
}
