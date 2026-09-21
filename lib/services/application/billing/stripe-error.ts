export class BillingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "BillingError";
  }
}

export function translateStripeError(error: unknown, defaultCode: string): never {
  const err = error as Record<string, unknown> | null | undefined;

  if (err && typeof err.type === "string") {
    const stripeType = err.type;
    const stripeMessage =
      typeof err.message === "string" ? err.message : defaultCode;

    switch (stripeType) {
      case "StripeCardError":
        throw new BillingError(stripeMessage, "PAYMENT_DECLINED", error);
      case "StripeRateLimitError":
        throw new BillingError(stripeMessage, "RATE_LIMIT", error);
      case "StripeInvalidRequestError":
        throw new BillingError(stripeMessage, "INVALID_REQUEST", error);
      case "StripeAuthenticationError":
        throw new BillingError(stripeMessage, "AUTH_ERROR", error);
      case "StripeAPIError":
        throw new BillingError(stripeMessage, "API_ERROR", error);
      case "StripeConnectionError":
        throw new BillingError(stripeMessage, "NETWORK_ERROR", error);
      default:
        throw new BillingError(stripeMessage, defaultCode, error);
    }
  }

  throw new BillingError(defaultCode, defaultCode, error);
}

// Codes whose messages are written by us (not passed through from Stripe),
// so they are safe to show to a school user.
const USER_SAFE_BILLING_CODES = new Set([
  "NO_SUBSCRIPTION",
  "NO_STRIPE_SUBSCRIPTION",
  "NO_STRIPE_CUSTOMER",
]);

/**
 * Maps an error thrown by a billing route to an HTTP status + optional
 * user-facing message. Anything else (raw Stripe errors, bugs) gets a bare
 * 500 with no message: details stay in the server log, and the UI falls back
 * to its own translated text.
 */
export function toBillingHttpError(error: unknown): { status: number; error?: string } {
  if (error instanceof BillingError && USER_SAFE_BILLING_CODES.has(error.code)) {
    return { status: 404, error: error.message };
  }

  return { status: 500 };
}
