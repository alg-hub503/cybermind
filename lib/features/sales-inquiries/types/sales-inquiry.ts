export interface SalesInquiry {
  id: string;
  userId: string;
  schoolId: string | null;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string | null;
  studentCount: number | null;
  currentSolution: string | null;
  requirements: string;
  demoRequested: boolean;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSalesInquiryDto {
  userId: string;
  schoolId?: string;
  organizationName: string;
  contactName: string;
  email: string;
  phone?: string;
  studentCount?: number;
  currentSolution?: string;
  requirements: string;
  demoRequested?: boolean;
}
