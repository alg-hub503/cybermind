import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-server-session";
import { requestEmailChangeSchema } from "@/lib/features/email-change/schemas/email-change.schema";
import { requestEmailChange } from "@/lib/features/email-change/email-change-actions";
import { sendEmailChangeVerification } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = requestEmailChangeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  try {
    const result = await requestEmailChange(
      userId,
      parsed.data.newEmail,
      parsed.data.currentPassword
    );

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Send verification email (non-blocking, best effort)
    try {
      await sendEmailChangeVerification(result.newEmail, result.rawToken);
    } catch (emailError) {
      console.error("Failed to send email change verification:", emailError);
    }

    return NextResponse.json({ message: "Verification email sent" }, { status: 200 });
  } catch (error) {
    console.error("Failed to request email change:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
