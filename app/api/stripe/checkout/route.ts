import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
try {
const session = await getServerSession(authOptions);

if (!session?.user?.email) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

const checkoutSession =
  await stripe.checkout.sessions.create({
    mode: "subscription",

    payment_method_types: ["card"],

    customer_email: session.user.email,

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "CyberMind PRO",
          },
          unit_amount: 1000,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],

    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
  });

return NextResponse.json({
  url: checkoutSession.url,
});

} catch (error) {
console.error(error);

return NextResponse.json(
  { error: "Checkout failed" },
  { status: 500 }
);

}
}