import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-server-session";
import { salesInquirySchema } from "@/lib/features/sales-inquiries/schemas/sales-inquiry.schema";
import { createSalesInquiry } from "@/lib/features/sales-inquiries/sales-inquiry-actions";
import { sendSalesInquiryNotification } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = salesInquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Get user context from session (trusted source)
  const userId = session.user.id;
  const schoolId = session.user.schoolId ?? undefined;
  const userName = session.user.name ?? "";
  const userEmail = session.user.email;

  try {
    // 1. Save to database (primary operation)
    const inquiry = await createSalesInquiry({
      userId,
      schoolId,
      organizationName: parsed.data.organizationName,
      contactName: userName,
      email: userEmail,
      phone: parsed.data.phone,
      studentCount: parsed.data.studentCount,
      currentSolution: parsed.data.currentSolution,
      requirements: parsed.data.requirements,
      demoRequested: parsed.data.demoRequested,
    });

    // 2. Send notification (non-blocking, best effort)
    try {
      await sendSalesInquiryNotification({
        contactName: userName,
        email: userEmail,
        organizationName: parsed.data.organizationName,
        phone: parsed.data.phone,
        studentCount: parsed.data.studentCount,
        currentSolution: parsed.data.currentSolution,
        requirements: parsed.data.requirements,
        demoRequested: parsed.data.demoRequested,
      });
    } catch (emailError) {
      // Log error but don't fail the request
      console.error("Failed to send sales inquiry notification:", emailError);
    }

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error("Failed to create sales inquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
