import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sendSms, generateOtp } from "@/lib/sms";

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.email || !body.password || !body.phone) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const phone = String(body.phone).trim();
    if (!/^\+?[1-9]\d{6,14}$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number" },
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
          phone,
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

    // Check cooldown: prevent rapid resend
    const lastVerification = await prisma.phoneVerification.findFirst({
      where: { userId: result.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (lastVerification) {
      const secondsSinceLastSend = Math.floor(
        (Date.now() - lastVerification.createdAt.getTime()) / 1000
      );
      if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
        return NextResponse.json({
          userId: result.user.id,
          schoolId: result.school.id,
          schoolName: result.school.name,
          phone,
          message: "OTP sent. Please wait before requesting a new code.",
          cooldownSeconds: RESEND_COOLDOWN_SECONDS - secondsSinceLastSend,
        });
      }
    }

    // Generate and store OTP
    const otp = generateOtp();
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.phoneVerification.create({
      data: {
        userId: result.user.id,
        phone,
        codeHash,
        expiresAt,
      },
    });

    // Send OTP via SMS
    await sendSms(phone, `Your CyberMind verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`);

    return NextResponse.json({
      userId: result.user.id,
      schoolId: result.school.id,
      schoolName: result.school.name,
      phone,
      message: "OTP sent to your phone",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Register failed" },
      { status: 500 }
    );
  }
}
