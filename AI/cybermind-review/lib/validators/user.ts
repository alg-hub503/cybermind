import { z } from "zod";

export const RoleSchema = z.enum([
  "ADMIN",
  "USER",
]);

export const SubscriptionSchema = z.enum([
  "FREE",
  "TRIAL",
  "PRO",
]);

export type RoleInput =
  z.infer<typeof RoleSchema>;

export type SubscriptionInput =
  z.infer<typeof SubscriptionSchema>;