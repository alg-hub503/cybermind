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
