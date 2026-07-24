export function hasActiveAccess(
  status: string | null | undefined
): boolean {
  return status === "TRIALING" || status === "ACTIVE";
}
export function isPro(plan: string | null | undefined): boolean {
  return plan === "PRO";
}
