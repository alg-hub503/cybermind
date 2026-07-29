import { Resend } from "resend";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM ?? "CyberMind <noreply@cybermind.app>";
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resend = getResend();
  const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;

  if (!resend || process.env.NODE_ENV !== "production") {
    console.log("=== DEV: Password Reset Link ===");
    console.log(`  To: ${email}`);
    console.log(`  URL: ${resetUrl}`);
    console.log("================================");
    return;
  }

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: email,
    subject: "Reset your CyberMind password",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #1e1e1e;">CyberMind</h1>
        <p style="color: #475569;">You requested a password reset. Click the button below to set a new password.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 14px;">This link expires in 60 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
  }
}
