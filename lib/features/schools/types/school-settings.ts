export interface SchoolSettings {
  id: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;

  // General
  description: string | null;

  // Branding
  logoUrl: string | null;
  coverUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;

  // Regional
  locale: string | null;
  currency: string | null;
  timezone: string | null;
  dateFormat: string | null;

  // Contact
  contactEmail: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;

  // Trial
  trialStart: Date | null;
  trialEnd: Date | null;

  // Invoicing
  invoicePrefix: string | null;
  invoiceNextNum: number;
  invoiceNotes: string | null;

  // Billing
  taxRate: number | null;
  billingEmail: string | null;

  // Legal / Tax
  taxNumber: string | null;
  crNumber: string | null;
  legalNotes: string | null;
}

export type UpdateSchoolSettingsDto = Partial<
  Omit<SchoolSettings, "id" | "schoolId" | "createdAt" | "updatedAt">
>;
