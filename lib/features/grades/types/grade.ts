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
