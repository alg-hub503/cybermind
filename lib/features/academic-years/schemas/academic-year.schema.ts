import { z } from "zod";

export const academicYearBaseSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isCurrent: z.boolean(),
});

export const academicYearSchema = academicYearBaseSchema.refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: "End date must be after start date", path: ["endDate"] },
);

export const updateAcademicYearSchema = academicYearBaseSchema.partial();

export type AcademicYearSchema = z.infer<typeof academicYearSchema>;
