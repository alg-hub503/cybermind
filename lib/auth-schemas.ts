import { z } from "zod";

import {
  MAX_PASSWORD_BYTES,
  MIN_PASSWORD_LENGTH,
  passwordByteLength,
} from "@/lib/auth-input";

/** Trims and lower-cases, then validates. The parsed value is the canonical email. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email");

export const passwordSchema = z
  .string()
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  )
  .refine((value) => passwordByteLength(value) <= MAX_PASSWORD_BYTES, {
    message: "Password is too long",
  });
