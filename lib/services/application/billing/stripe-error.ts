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
