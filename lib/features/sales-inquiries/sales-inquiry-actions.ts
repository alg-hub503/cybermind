import { PrismaSalesInquiryRepository } from "./repositories/prisma-sales-inquiry-repository";
import type { CreateSalesInquiryDto } from "./types/sales-inquiry";

const repository = new PrismaSalesInquiryRepository();

export async function createSalesInquiry(data: CreateSalesInquiryDto) {
  const inquiry = await repository.create(data);
  return inquiry;
}

export async function getSalesInquiryById(id: string) {
  return repository.findById(id);
}

export async function getSalesInquiriesByUser(userId: string) {
  return repository.findByUser(userId);
}

export async function getAllSalesInquiries() {
  return repository.findAll();
}

export async function updateSalesInquiryStatus(
  id: string,
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED"
) {
  return repository.updateStatus(id, status);
}
