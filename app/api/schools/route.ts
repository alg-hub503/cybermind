import { NextResponse } from "next/server";
import { requireSession, toApiError } from "@/lib/authorization";

import { ADMIN_ROLE } from "@/lib/constants";
import { getSchools, createSchool } from "@/lib/features/schools/school-actions";
import { schoolSchema } from "@/lib/features/schools/schemas/school.schema";

export async function GET() {
  const access = await requireSession().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

  if (session.user.role === ADMIN_ROLE) {
    const schools = await getSchools();
    return NextResponse.json(schools);
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ success: true, data: [] });
  }

  const school = await (await import("@/lib/features/schools/school-actions")).getSchool(session.user.schoolId);
  return NextResponse.json(school ? [school] : []);
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
  const parsed = schoolSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const school = await createSchool(parsed.data);
  return NextResponse.json(school, { status: 201 });
}
