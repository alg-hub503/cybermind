export interface SubjectAssignment {
  id: string;
  schoolId: string;
  classId: string;
  teacherId: string;
  subject: string;
  createdAt: Date;
  class?: { id: string; name: string };
  teacher?: { id: string; user: { name: string | null } };
}

export interface CreateSubjectAssignmentDto {
  schoolId: string;
  classId: string;
  teacherId: string;
  subject: string;
}
