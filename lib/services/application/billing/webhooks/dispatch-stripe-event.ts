import Stripe from "stripe";
import { handleCheckoutCompleted } from "./handle-checkout-completed";
import { handleSubscriptionUpdated } from "./handle-subscription-updated";
import { handleSubscriptionDeleted } from "./handle-subscription-deleted";
import { handleInvoicePaymentFailed } from "./handle-invoice-payment-failed";

export async function dispatchStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
}
