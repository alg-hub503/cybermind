import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaEmailChangeRepository } from "./repositories/prisma-email-change-repository";

const repository = new PrismaEmailChangeRepository();

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_TOKENS_PER_WINDOW = 3;
const MAX_PASSWORD_ATTEMPTS = 5;
const PASSWORD_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function requestEmailChange(userId: string, newEmail: string, currentPassword: string) {
  // 1. Check password rate limit (before any bcrypt work)
  const recentAttempts = await repository.countRecentFailedAttempts(
    userId,
    new Date(Date.now() - PASSWORD_WINDOW_MS)
  );
  if (recentAttempts >= MAX_PASSWORD_ATTEMPTS) {
    return { error: "Too many password attempts. Please try again later." };
  }

  // 2. Get user
  const user = await repository.findUserById(userId);
  if (!user) {
    return { error: "User not found" };
  }

  // 3. Verify current password
  if (!user.password) {
    return { error: "No password set" };
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    await repository.recordFailedPasswordAttempt(userId);
    return { error: "Invalid password" };
  }

  // 4. Check new email is different from current
  if (newEmail.toLowerCase() === user.email.toLowerCase()) {
    return { error: "New email must be different from current email" };
  }

  // 5. Check new email is not already taken
  const existingUser = await repository.findUserByEmail(newEmail.toLowerCase());
  if (existingUser) {
    return { error: "Email already in use" };
  }

  // 6. Rate limiting (tokens)
  const recentTokens = await repository.findRecentTokens(
    userId,
    new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
  );
  if (recentTokens >= MAX_TOKENS_PER_WINDOW) {
    return { error: "Too many requests. Please try again later." };
  }

  // 7. Set pending email
  await repository.setPendingEmail(userId, newEmail.toLowerCase());

  // 8. Generate token
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  // 9. Store token
  const token = await repository.createToken(userId, tokenHash, expiresAt);

  // 10. Clean up old tokens
  await repository.deleteOldTokens(userId, token.id);

  return { success: true, rawToken, newEmail: newEmail.toLowerCase() };
}

export async function verifyEmailChange(token: string) {
  // 1. Hash the token
  const tokenHash = createHash("sha256").update(token).digest("hex");

  // 2. Find token
  const tokenRecord = await repository.findTokenByHash(tokenHash);
  if (!tokenRecord) {
    return { error: "Invalid token" };
  }

  // 3. Check if used
  if (tokenRecord.usedAt) {
    return { error: "Token already used" };
  }

  // 4. Check if expired
  if (tokenRecord.expiresAt < new Date()) {
    return { error: "Token expired" };
  }

  // 5. Get user's pending email
  const user = await repository.findUserById(tokenRecord.userId);
  if (!user || !user.email) {
    return { error: "User not found" };
  }

  // We need to get the pending email from the database
  // Since findUserById doesn't return pendingEmail, we need to query it
  const { prisma } = await import("@/lib/prisma");
  const fullUser = await prisma.user.findUnique({
    where: { id: tokenRecord.userId },
    select: { pendingEmail: true, email: true },
  });

  if (!fullUser?.pendingEmail) {
    return { error: "No pending email change" };
  }

  const oldEmail = fullUser.email;
  const newEmail = fullUser.pendingEmail;

  // 6. Update email
  await repository.updateUserEmail(tokenRecord.userId, newEmail);

  // 7. Mark token used
  await repository.markTokenUsed(tokenRecord.id);

  // 8. Clean up old tokens
  await repository.deleteOldTokens(tokenRecord.userId, tokenRecord.id);

  return { success: true, oldEmail, newEmail };
}
