import { Resend } from "resend";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM ?? "CyberMind <onboarding@resend.dev>";
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
    console.error("Failed to send password reset email:", JSON.stringify(error));
    throw new Error(typeof error === "object" && error !== null ? (error as { message?: string }).message ?? "Resend API error" : "Resend API error");
  }
}

interface ContactNotificationParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactNotification(params: ContactNotificationParams): Promise<void> {
  const resend = getResend();
  const supportEmail = process.env.SUPPORT_EMAIL || "support@cybermind.app";

  if (!resend || process.env.NODE_ENV !== "production") {
    console.log("=== DEV: Contact Us Message ===");
    console.log(`  From: ${params.name} <${params.email}>`);
    console.log(`  Subject: ${params.subject}`);
    console.log(`  Message: ${params.message}`);
    console.log("===============================");
    return;
  }

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: supportEmail,
    replyTo: params.email,
    subject: `[Contact Us] ${params.subject}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e1e1e;">New Contact Us Message</h1>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="color: #475569; margin: 4px 0;"><strong>From:</strong> ${params.name}</p>
          <p style="color: #475569; margin: 4px 0;"><strong>Email:</strong> ${params.email}</p>
          <p style="color: #475569; margin: 4px 0;"><strong>Subject:</strong> ${params.subject}</p>
        </div>
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="color: #1e1e1e; white-space: pre-wrap;">${params.message}</p>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">This message was sent via the CyberMind Contact Us form.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send contact notification:", JSON.stringify(error));
    throw new Error(typeof error === "object" && error !== null ? (error as { message?: string }).message ?? "Resend API error" : "Resend API error");
  }
}
