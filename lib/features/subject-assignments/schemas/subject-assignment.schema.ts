import { z } from "zod";

export const subjectAssignmentSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  classId: z.string().min(1, "Class is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  subject: z.string().min(1, "Subject is required"),
});

export type SubjectAssignmentSchema = z.infer<typeof subjectAssignmentSchema>;
