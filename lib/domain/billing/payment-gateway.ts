export interface PaymentGateway {
  createCheckoutSession(): Promise<string>;
  createCustomerPortal(): Promise<string>;
}
