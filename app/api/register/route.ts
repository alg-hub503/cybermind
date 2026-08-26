import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";

const TOKEN_EXPIRY_HOURS = 24;

function sha256(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(String(body.password), 12);

    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: `${body.email.split("@")[0]} School`,
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
          email: body.email,
          name: body.name ?? null,
          password: hashedPassword,
          schoolId: school.id,
          phone: body.phone ? String(body.phone).trim() : null,
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
        "VIEW_REPORTS", "MANAGE_SCHOOL_SETTINGS", "MANAGE_BILLING",
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

    // Generate email verification token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.emailVerification.create({
      data: {
        userId: result.user.id,
        email: result.user.email,
        tokenHash,
        expiresAt,
      },
    });

    // Send verification email (logs to console in dev, sends via Resend in production)
    await sendVerificationEmail(result.user.email, token);

    return NextResponse.json({
      userId: result.user.id,
      schoolId: result.school.id,
      schoolName: result.school.name,
      email: result.user.email,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Register failed" },
      { status: 500 }
    );
  }
}
