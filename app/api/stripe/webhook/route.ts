import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();

  const signature = (await headers()).get(
    "stripe-signature"
  );

  if (!signature) {
    return NextResponse.json(
      {
        error: "Missing Stripe signature",
      },
      {
        status: 400,
      }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("====================================");
    console.error("Webhook verification failed");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    console.error("====================================");

    return NextResponse.json(
      {
        error: "Webhook Error",
      },
      {
        status: 400,
      }
    );
  }

  console.log("====================================");
  console.log("Stripe Event:", event.type);
  console.log("====================================");

  if (event.type === "checkout.session.completed") {
    const session =
      event.data.object as Stripe.Checkout.Session;

    console.log("========== CHECKOUT SESSION ==========");
    console.log(session);
    console.log("Customer Email:", session.customer_email);
    console.log("======================================");

    const email = session.customer_email;

    if (!email) {
      console.log("Stripe returned NO customer_email.");
    } else {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      console.log("Database User:", user);

      if (!user) {
        console.log("No user found with email:", email);
      } else {
        await prisma.user.update({
          where: {
            email,
          },
          data: {
            subscriptionStatus: "PRO",
          },
        });

        console.log(
          "User upgraded to PRO:",
          email
        );
      }
    }
  }

  return NextResponse.json({
    received: true,
  });
}