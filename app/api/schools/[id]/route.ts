import { NextRequest, NextResponse } from "next/server";
import { getSchool, updateSchool, deleteSchool } from "@/lib/features/schools/school-actions";
import { schoolSchema } from "@/lib/features/schools/schemas/school.schema";

const updateSchoolSchema = schoolSchema.partial();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const school = await getSchool(id);
  if (!school) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(school);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  await deleteSchool(id);
  return NextResponse.json({ success: true });
}
