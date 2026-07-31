import { NextRequest, NextResponse } from "next/server";

import {
  requireAdmin,
  requireSchoolAccess,
} from "@/lib/authorization";
import { getSchool, updateSchool, deleteSchool } from "@/lib/features/schools/school-actions";
import { schoolSchema } from "@/lib/features/schools/schemas/school.schema";

const updateSchoolSchema = schoolSchema.partial();

type AccessError = { error: string; status: 401 | 403 };

function toAccessError(error: unknown): AccessError {
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return { error: "Forbidden", status: 403 };
  }
  return { error: "Unauthorized", status: 401 };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const access = await requireSchoolAccess(id).catch(toAccessError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const school = await getSchool(id);
  if (!school) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(school);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const access = await requireAdmin().catch(toAccessError);
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

  const access = await requireAdmin().catch(toAccessError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  await deleteSchool(id);
  return NextResponse.json({ success: true });
}
