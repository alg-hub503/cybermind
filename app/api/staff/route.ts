import { NextResponse } from "next/server";
import { requireSession, toApiError } from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { getStaff, getStaffBySchool, createStaffMember } from "@/lib/features/staff/staff-actions";
import { createStaffSchema } from "@/lib/features/staff/schemas/staff.schema";

export async function GET() {
  const access = await requireSession().catch(toApiError);
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
  const access = await requireSession().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

  if (session.user.role !== ADMIN_ROLE) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createStaffSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
