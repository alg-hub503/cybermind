import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCustomerPortal } from "@/lib/services/application/billing/create-customer-portal";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const schoolId = body.schoolId ?? session.user.schoolId;

    if (schoolId !== session.user.schoolId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const url = await createCustomerPortal(schoolId, `${appUrl}/dashboard/billing`);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Portal creation failed" },
      { status: 500 }
    );
  }
}
