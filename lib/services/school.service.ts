import { prisma } from "@/lib/prisma";

export async function getSchools() {
  return prisma.school.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getSchoolById(id: string) {
  return prisma.school.findUnique({
    where: {
      id,
    },
  });
}

export async function getSchoolByName(name: string) {
  return prisma.school.findFirst({
    where: {
      name,
    },
  });
}

export async function createSchool(name: string) {
  return prisma.school.create({
    data: {
      name,
    },
  });
}

export async function updateSchool(
  id: string,
  name: string
) {
  return prisma.school.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
}

export async function deleteSchool(id: string) {
  return prisma.school.delete({
    where: {
      id,
    },
  });
}
export async function countSchools(where?: {
  name?: {
    contains: string;
    mode: "insensitive";
  };
}) {
  return prisma.school.count({
    where,
  });
}

export async function getSchoolsPaginated(
  where: {
    name?: {
      contains: string;
      mode: "insensitive";
    };
  } | undefined,
  orderBy:
    | { name: "asc" | "desc"; createdAt?: undefined }
    | { createdAt: "asc" | "desc"; name?: undefined },
  skip: number,
  take: number
) {
  return prisma.school.findMany({
    where,
    orderBy,
    skip,
    take,
  });
}

