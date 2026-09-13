import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth, toApiError } from "@/lib/authorization";
import { getTeacherByUserId, updateTeacher } from "@/lib/features/teachers/teacher-actions";
import { getStaffByUserId, updateStaffMember } from "@/lib/features/staff/staff-actions";

// Deliberately narrower than the admin-facing update schemas: no `status`
// and no `hireDate` — those remain admin-only fields, changeable only via
// the existing MANAGE_TEACHERS/MANAGE_STAFF-gated routes.
const selfServiceTeacherSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().nullable().optional(),
  specialization: z.string().nullable().optional(),
  qualifications: z.string().nullable().optional(),
});

const selfServiceStaffSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
});

export async function GET() {
  const access = await requireAuth().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { user } = access;

  if (user.role === "TEACHER") {
    const profile = await getTeacherByUserId(user.id);
    if (!profile) return NextResponse.json({ type: "none" });
    return NextResponse.json({ type: "teacher", profile });
  }

  if (user.role === "STAFF") {
    const profile = await getStaffByUserId(user.id);
    if (!profile) return NextResponse.json({ type: "none" });
    return NextResponse.json({ type: "staff", profile });
  }

  return NextResponse.json({ type: "none" });
}

export async function PUT(req: Request) {
  const access = await requireAuth().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { user } = access;

  const body = await req.json();

  if (user.role === "TEACHER") {
    const profile = await getTeacherByUserId(user.id);
    if (!profile) {
      return NextResponse.json({ error: "No teacher profile found" }, { status: 404 });
    }

    const parsed = selfServiceTeacherSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await updateTeacher(profile.id, parsed.data);
    return NextResponse.json(updated);
  }

  if (user.role === "STAFF") {
    const profile = await getStaffByUserId(user.id);
    if (!profile) {
      return NextResponse.json({ error: "No staff profile found" }, { status: 404 });
    }

    const parsed = selfServiceStaffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await updateStaffMember(profile.id, parsed.data);
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "No editable profile for this account" }, { status: 400 });
}
