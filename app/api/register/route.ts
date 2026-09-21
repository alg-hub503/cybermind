import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { emailSchema, passwordSchema } from "@/lib/auth-schemas";
import { findUserByLoginEmail } from "@/lib/services/domain/user.service";

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().max(100).nullish(),
});

const USER_EXISTS_ERROR = "User already exists";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      // The register form shows `error` as-is, so surface the first
      // human-readable reason (e.g. "Password must be at least 8 characters").
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid input",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    // `email` is already trimmed + lower-cased by emailSchema.
    const { email, password, name } = parsed.data;

    const existingUser = await findUserByLoginEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: USER_EXISTS_ERROR },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: `${email.split("@")[0]} School`,
        },
      });

      const platformSettings = await tx.platformSettings.findUnique({
        where: { id: "singleton" },
      });
      const duration = platformSettings?.trialDurationDays ?? 14;
      const now = new Date();

      await tx.schoolSettings.create({
        data: {
          schoolId: school.id,
          trialStart: now,
          trialEnd: new Date(now.getTime() + duration * 24 * 60 * 60 * 1000),
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          name: name || null,
          password: hashedPassword,
          schoolId: school.id,
          role: "USER",
        },
      });

      const defaultRoles = [
        { name: "ADMIN", systemKey: "SCHOOL_ADMIN", description: "School administrator with full access", isDefault: true, schoolId: school.id },
        { name: "TEACHER", systemKey: "TEACHER", description: "Teacher with student management access", isDefault: true, schoolId: school.id },
        { name: "STAFF", systemKey: "STAFF", description: "Staff member with limited access", isDefault: true, schoolId: school.id },
      ];

      const roleMap: Record<string, string> = {};

      for (const roleDef of defaultRoles) {
        const created = await tx.role.create({ data: roleDef });
        roleMap[roleDef.name] = created.id;
      }

      const permissions = await tx.permission.findMany();
      const permMap: Record<string, string> = {};
      for (const p of permissions) {
        permMap[p.code] = p.id;
      }

      const adminPermCodes = [
        "MANAGE_STUDENTS", "MANAGE_TEACHERS", "MANAGE_STAFF",
        "MANAGE_CLASSES", "MANAGE_GRADES", "MANAGE_ACADEMIC_YEARS",
        "VIEW_REPORTS", "MANAGE_SCHOOL_SETTINGS", "VIEW_BILLING", "MANAGE_BILLING",
      ];
      for (const code of adminPermCodes) {
        if (permMap[code]) {
          await tx.rolePermission.create({
            data: { roleId: roleMap["ADMIN"], permissionId: permMap[code] },
          });
        }
      }

      for (const code of ["MANAGE_STUDENTS", "VIEW_REPORTS"]) {
        if (permMap[code]) {
          await tx.rolePermission.create({
            data: { roleId: roleMap["TEACHER"], permissionId: permMap[code] },
          });
        }
      }

      for (const code of ["VIEW_REPORTS", "MANAGE_SCHOOL_SETTINGS"]) {
        if (permMap[code]) {
          await tx.rolePermission.create({
            data: { roleId: roleMap["STAFF"], permissionId: permMap[code] },
          });
        }
      }

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: roleMap["ADMIN"],
          schoolId: school.id,
        },
      });

      return { user, school };
    });

    return NextResponse.json({
      id: result.user.id,
      email: result.user.email,
      schoolId: result.school.id,
      message: "User and School created successfully",
    });
  } catch (error) {
    // Two simultaneous sign-ups with the same email: the unique index wins.
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: USER_EXISTS_ERROR },
        { status: 400 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Register failed" },
      { status: 500 }
    );
  }
}
