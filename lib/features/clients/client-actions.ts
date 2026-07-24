import { ClientService } from "@/lib/features/clients/services/client-service";

const service = new ClientService();

export async function getClients() {
  return service.getAll();
}

export async function getClient(id: string) {
  return service.getById(id);
}

export async function getClientsBySchool(schoolId: string, limit?: number) {
  return service.getBySchool(schoolId, limit);
}

export async function countClientsBySchool(schoolId: string) {
  return service.countBySchool(schoolId);
}

export async function createClient(data: Parameters<ClientService["create"]>[0]) {
  return service.create(data);
}

export async function updateClient(
  id: string,
  data: Parameters<ClientService["update"]>[1]
) {
  return service.update(id, data);
}

export async function deleteClient(id: string) {
  return service.delete(id);
}
