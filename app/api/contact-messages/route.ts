import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-server-session";
import { contactMessageSchema } from "@/lib/features/contact-messages/schemas/contact-message.schema";
import { createContactMessage } from "@/lib/features/contact-messages/contact-message-actions";
import { sendContactNotification } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = contactMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Get user context from session (trusted source)
  const userId = session.user.id;
  const schoolId = session.user.schoolId ?? undefined;
  const userName = session.user.name ?? parsed.data.name;
  const userEmail = session.user.email;

  try {
    // 1. Save to database (primary operation)
    const message = await createContactMessage({
      userId,
      schoolId,
      name: userName,
      email: userEmail,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    // 2. Send notification (non-blocking, best effort)
    try {
      await sendContactNotification({
        name: userName,
        email: userEmail,
        subject: parsed.data.subject,
        message: parsed.data.message,
      });
    } catch (emailError) {
      // Log error but don't fail the request
      console.error("Failed to send contact notification:", emailError);
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Failed to create contact message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
