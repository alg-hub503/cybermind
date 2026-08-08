import { NextResponse } from "next/server";
import { verifyEmailChangeSchema } from "@/lib/features/email-change/schemas/email-change.schema";
import { verifyEmailChange } from "@/lib/features/email-change/email-change-actions";
import { sendEmailChangeNotification } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = verifyEmailChangeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await verifyEmailChange(parsed.data.token);

    if ("error" in result) {
      const status = result.error === "Token already used" ? 400 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    // Send notification to old email (non-blocking, best effort)
    try {
      await sendEmailChangeNotification(result.oldEmail, result.newEmail);
    } catch (emailError) {
      console.error("Failed to send email change notification:", emailError);
    }

    return NextResponse.json({ message: "Email changed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to verify email change:", error);
    return NextResponse.json(
      { error: "Failed to verify email change" },
      { status: 500 }
    );
  }
}
