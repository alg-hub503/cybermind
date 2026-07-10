import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { createInvoice } from "@/lib/services/invoice.service";
import { CreateInvoiceSchema } from "@/lib/validators/invoice";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user?.schoolId) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 400 }
      );
    }

    const rawBody = await request.json();

    const body = CreateInvoiceSchema.parse({
      clientId: rawBody.clientId,
      amount: Number(rawBody.amount),
    });

    const invoice = await createInvoice({
      id: crypto.randomUUID(),
      amount: body.amount,
      clientId: body.clientId,
      schoolId: user.schoolId,
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Invalid request",
      },
      {
        status: 400,
      }
    );
  }
}