export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  createdAt: Date;
}

export interface CreateAcademicYearDto {
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface UpdateAcademicYearDto {
  name?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}
