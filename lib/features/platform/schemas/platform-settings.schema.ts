import { z } from "zod";

export const platformSettingsSchema = z.object({
  // Platform Identity
  platformName: z.string().max(100).trim().nullable().optional(),
  defaultLogoUrl: z.string().url().trim().nullable().optional(),
  defaultPrimaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  supportEmail: z.string().email().trim().nullable().optional(),

  // Trial Defaults
  trialDurationDays: z.number().int().min(1).max(365).optional(),
  trialWarningDays: z.number().int().min(1).max(30).optional(),

  // Platform
  maintenanceMode: z.boolean().optional(),
});

export type PlatformSettingsSchema = z.infer<typeof platformSettingsSchema>;
