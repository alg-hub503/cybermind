import { prisma } from "@/lib/prisma";
import type { CreateRoleDto, UpdateRoleDto } from "../types/role";

export class PrismaRoleRepository {
  async findAll() {
    return prisma.role.findMany({
      include: {
        RolePermission: {
          include: { permission: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findBySchoolId(schoolId: string) {
    return prisma.role.findMany({
      where: { schoolId },
      include: {
        RolePermission: {
          include: { permission: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        RolePermission: {
          include: { permission: true },
        },
      },
    });
  }

  async findByName(name: string, schoolId: string) {
    return prisma.role.findFirst({
      where: { name, schoolId },
    });
  }

  async create(data: CreateRoleDto) {
    const { permissionIds, ...rest } = data;
    return prisma.role.create({
      data: {
        ...rest,
        RolePermission: permissionIds?.length
          ? {
              create: permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      include: {
        RolePermission: {
          include: { permission: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateRoleDto) {
    const { permissionIds, ...rest } = data;

    if (permissionIds !== undefined) {
      await prisma.rolePermission.deleteMany({ where: { roleId: id } });
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        });
      }
    }

    return prisma.role.update({
      where: { id },
      data: rest,
      include: {
        RolePermission: {
          include: { permission: true },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.role.delete({ where: { id } });
  }
}
