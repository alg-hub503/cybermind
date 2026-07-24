import { NextResponse } from "next/server";
import { getSchools, createSchool } from "@/lib/features/schools/school-actions";
import { schoolSchema } from "@/lib/features/schools/schemas/school.schema";
import { School } from "@/lib/features/schools/types/school";

export async function GET() {
  const schools: School[] = await getSchools();
  return NextResponse.json(schools);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schoolSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }
  const school = await createSchool(parsed.data);
  return NextResponse.json(school, { status: 201 });
}
