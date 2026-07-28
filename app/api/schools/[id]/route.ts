import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-server-session";

import { ADMIN_ROLE } from "@/lib/constants";
import { getSchool, updateSchool, deleteSchool } from "@/lib/features/schools/school-actions";
import { schoolSchema } from "@/lib/features/schools/schemas/school.schema";

const updateSchoolSchema = schoolSchema.partial();

async function requireAdmin() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const };
  }
  if (session.user.role !== ADMIN_ROLE) {
    return { error: "Forbidden", status: 403 as const };
  }
  return { session };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ADMIN_ROLE && session.user.schoolId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const school = await getSchool(id);
  if (!school) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(school);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireAdmin();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = await req.json();
  const parsed = updateSchoolSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const school = await updateSchool(id, parsed.data);
  return NextResponse.json(school);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireAdmin();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  await deleteSchool(id);
  return NextResponse.json({ success: true });
}
