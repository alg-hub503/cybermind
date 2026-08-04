export interface PlatformSettings {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Platform Identity
  platformName: string | null;
  defaultLogoUrl: string | null;
  defaultPrimaryColor: string | null;
  supportEmail: string | null;

  // Trial Defaults
  trialDurationDays: number;
  trialWarningDays: number;

  // Platform
  maintenanceMode: boolean;
}

export type UpdatePlatformSettingsDto = Partial<
  Omit<PlatformSettings, "id" | "createdAt" | "updatedAt">
>;
