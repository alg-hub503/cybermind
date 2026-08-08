import { PrismaContactMessageRepository } from "./repositories/prisma-contact-message-repository";
import type { CreateContactMessageDto } from "./types/contact-message";

const repository = new PrismaContactMessageRepository();

export async function createContactMessage(data: CreateContactMessageDto) {
  const message = await repository.create(data);
  return message;
}

export async function getContactMessageById(id: string) {
  return repository.findById(id);
}

export async function getContactMessagesByUser(userId: string) {
  return repository.findByUser(userId);
}

export async function getAllContactMessages() {
  return repository.findAll();
}

export async function updateContactMessageStatus(
  id: string,
  status: "NEW" | "READ" | "REPLIED"
) {
  return repository.updateStatus(id, status);
}
