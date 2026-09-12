import { NextRequest, NextResponse } from "next/server";

import {
  requireResourceAccess,
  requirePermission,
  toApiError,
} from "@/lib/authorization";
import {
  getSubjectAssignment,
  deleteSubjectAssignment,
} from "@/lib/features/subject-assignments/subject-assignment-actions";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const assignment = await getSubjectAssignment(id);
  const access = await requireResourceAccess(assignment).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json(assignment);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const assignment = await getSubjectAssignment(id);
  const access = await requireResourceAccess(assignment).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const permCheck = await requirePermission("MANAGE_SUBJECT_ASSIGNMENTS").catch(toApiError);
  if ("error" in permCheck) {
    return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
  }

  await deleteSubjectAssignment(id);
  return NextResponse.json({ success: true });
}
