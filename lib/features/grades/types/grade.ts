export interface Grade {
  id: string;
  schoolId: string;
  name: string;
  order: number;
  createdAt: Date;
}

export interface CreateGradeDto {
  schoolId: string;
  name: string;
  order: number;
}

export interface UpdateGradeDto {
  name?: string;
  order?: number;
}

export interface GradeWithClasses extends Grade {
  classes: Array<{
    id: string;
    name: string;
    code: string;
    academicYear: { id: string; name: string };
  }>;
}
