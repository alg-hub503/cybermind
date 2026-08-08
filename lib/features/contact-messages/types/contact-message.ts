export interface ContactMessage {
  id: string;
  userId: string;
  schoolId: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactMessageDto {
  userId: string;
  schoolId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}
