export type TrialAccessStatus =
  | "LEGACY"
  | "TRIALING"
  | "EXPIRED"
  | "SUBSCRIPTION_MANAGED";

export interface TrialAccessResult {
  status: TrialAccessStatus;
  subscriptionStatus: string | null;
  trialEnd: Date | null;
  daysLeft: number | null;
  warningDays: number | null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface SchoolInput {
  subscription: { status: string } | null;
  settings: { trialStart: Date | null; trialEnd: Date | null } | null;
}

interface PlatformSettingsInput {
  trialWarningDays: number;
}

export function resolveTrialStatus(
  school: SchoolInput,
  platformSettings: PlatformSettingsInput
): TrialAccessResult {
  if (school.subscription) {
    return {
      status: "SUBSCRIPTION_MANAGED",
      subscriptionStatus: school.subscription.status,
      trialEnd: null,
      daysLeft: null,
      warningDays: null,
    };
  }

  if (!school.settings || school.settings.trialStart === null) {
    return {
      status: "LEGACY",
      subscriptionStatus: null,
      trialEnd: null,
      daysLeft: null,
      warningDays: null,
    };
  }

  const now = new Date();
  const trialEndDate = school.settings.trialEnd;

  if (!trialEndDate) {
    return {
      status: "LEGACY",
      subscriptionStatus: null,
      trialEnd: null,
      daysLeft: null,
      warningDays: null,
    };
  }

  if (now < trialEndDate) {
    const daysLeft = Math.ceil(
      (trialEndDate.getTime() - now.getTime()) / MS_PER_DAY
    );
    return {
      status: "TRIALING",
      subscriptionStatus: null,
      trialEnd: trialEndDate,
      daysLeft,
      warningDays: platformSettings.trialWarningDays,
    };
  }

  return {
    status: "EXPIRED",
    subscriptionStatus: null,
    trialEnd: trialEndDate,
    daysLeft: 0,
    warningDays: platformSettings.trialWarningDays,
  };
}

export function toAccessString(result: TrialAccessResult): string {
  if (result.status === "SUBSCRIPTION_MANAGED") {
    return result.subscriptionStatus ?? "ACTIVE";
  }
  if (result.status === "EXPIRED") {
    return "EXPIRED";
  }
  return "TRIALING";
}
