import { getSchoolById } from "@/lib/services/domain/school.service";
import { getClientCountBySchool } from "@/lib/services/domain/client.service";
import {
  getInvoiceCountBySchool,
  getRevenueBySchool,
} from "@/lib/services/domain/invoice.service";
import { getUserCountBySchool } from "@/lib/services/domain/user.service";

export async function getDashboardOverview(schoolId: string) {
  const [
    school,
    totalClients,
    totalInvoices,
    totalUsers,
    totalRevenue,
  ] = await Promise.all([
    getSchoolById(schoolId),
    getClientCountBySchool(schoolId),
    getInvoiceCountBySchool(schoolId),
    getUserCountBySchool(schoolId),
    getRevenueBySchool(schoolId),
  ]);

  return {
    school,
    totalClients,
    totalInvoices,
    totalUsers,
    totalRevenue,
  };
}
