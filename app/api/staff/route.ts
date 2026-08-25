import { NextResponse } from "next/server";
import { requireAuth, requirePermission, toApiError } from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { getStaff, getStaffBySchool, createStaffMember } from "@/lib/features/staff/staff-actions";
import { createStaffSchema } from "@/lib/features/staff/schemas/staff.schema";
import { getSchoolById } from "@/lib/services/domain/school.service";

export async function GET() {
  const access = await requireAuth().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

  if (session.user.role === ADMIN_ROLE) {
    const staff = await getStaff();
    return NextResponse.json(staff);
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ error: "No school assigned" }, { status: 403 });
  }

  const staff = await getStaffBySchool(session.user.schoolId);
  return NextResponse.json(staff);
}

export async function POST(req: Request) {
  const access = await requirePermission("MANAGE_STAFF").catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { user } = access;

  const body = await req.json();
  const parsed = createStaffSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (user.role !== ADMIN_ROLE && user.schoolId !== parsed.data.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const school = await getSchoolById(parsed.data.schoolId);
  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 400 });
  }

  try {
    const staff = await createStaffMember(parsed.data);
    return NextResponse.json(staff, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school does not exist" }, { status: 400 });
    }
    throw err;
  }
}
