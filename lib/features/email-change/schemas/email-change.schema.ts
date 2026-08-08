import { z } from "zod";

export const requestEmailChangeSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  currentPassword: z.string().min(1, "Password is required"),
});

export type RequestEmailChangeSchema = z.infer<typeof requestEmailChangeSchema>;

export const verifyEmailChangeSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type VerifyEmailChangeSchema = z.infer<typeof verifyEmailChangeSchema>;
