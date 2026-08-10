import { z } from "zod";

const LOCALE_VALUES = ["ar", "en"] as const;
const CURRENCY_VALUES = [
  "SAR", "USD", "EUR", "AED", "KWD", "BHD", "QAR", "OMR", "JOD",
  "EGP", "TRY", "GBP",
] as const;
const TIMEZONE_VALUES = [
  "Asia/Riyadh", "Asia/Dubai", "Asia/Muscat", "Asia/Bahrain", "Asia/Qatar",
  "Asia/Kuwait", "Asia/Aden", "Asia/Baghdad", "Asia/Amman", "Asia/Damascus",
  "Asia/Beirut", "Asia/Gaza", "Asia/Hebron",
  "Africa/Cairo", "Africa/Tripoli", "Africa/Tunis", "Africa/Algiers", "Africa/Casablanca",
  "Asia/Tehran", "Asia/Karachi", "Asia/Dhaka", "Asia/Kuala_Lumpur", "Asia/Jakarta",
  "Europe/Istanbul",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Toronto", "Asia/Tokyo", "Asia/Singapore", "Asia/Shanghai", "Australia/Sydney",
] as const;
const DATE_FORMAT_VALUES = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] as const;

export const schoolSettingsSchema = z.object({
  description: z.string().max(500).nullable().optional(),

  // Branding
  logoUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  faviconUrl: z.string().url().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),

  // Regional
  locale: z.enum(LOCALE_VALUES).nullable().optional(),
  currency: z.enum(CURRENCY_VALUES).nullable().optional(),
  timezone: z.enum(TIMEZONE_VALUES).nullable().optional(),
  dateFormat: z.enum(DATE_FORMAT_VALUES).nullable().optional(),

  // Contact
  contactEmail: z.string().email().nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  website: z.string().url().nullable().optional(),
  address: z.string().max(500).nullable().optional(),

  // Invoicing
  invoicePrefix: z.string().max(10).nullable().optional(),
  invoiceNextNum: z.number().int().min(1).optional(),
  invoiceNotes: z.string().max(500).nullable().optional(),

  // Billing
  taxRate: z.number().min(0).max(100).nullable().optional(),
  billingEmail: z.string().email().nullable().optional(),

  // Legal / Tax
  taxNumber: z.string().max(50).nullable().optional(),
  crNumber: z.string().max(50).nullable().optional(),
  legalNotes: z.string().max(500).nullable().optional(),
});

export type SchoolSettingsSchema = z.infer<typeof schoolSettingsSchema>;
