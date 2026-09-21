/**
 * Shared, dependency-free rules for emails and passwords.
 *
 * Safe to import from client components (no zod, no server-only code).
 * Zod schemas built on top of these live in `lib/auth-schemas.ts`.
 */

export const MIN_PASSWORD_LENGTH = 8;

// bcrypt only looks at the first 72 BYTES of a password. Rejecting longer
// input avoids silently truncating what the user typed.
export const MAX_PASSWORD_BYTES = 72;

/**
 * Canonical form used everywhere an email is stored or looked up:
 * trimmed and lower-cased.
 */
export function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function passwordByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}
