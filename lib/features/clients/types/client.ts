export interface Client {
  id: string;
  name: string;
  schoolId: string;
}
export interface CreateClientDto {
  name: string;
  schoolId: string;
}
export interface UpdateClientDto {
  name?: string;
}
