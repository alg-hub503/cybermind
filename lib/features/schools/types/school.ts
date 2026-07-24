export interface School {
  id: string;
  name: string;
  stripeCustomerId?: string | null;
}
export interface CreateSchoolDto {
  name: string;
}
export interface UpdateSchoolDto {
  name?: string;
}
