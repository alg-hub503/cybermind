import { z } from "zod";

export const salesInquirySchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  phone: z.string().optional(),
  studentCount: z.number().int().positive().optional(),
  currentSolution: z.string().optional(),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  demoRequested: z.boolean().optional(),
});

export type SalesInquirySchema = z.infer<typeof salesInquirySchema>;
