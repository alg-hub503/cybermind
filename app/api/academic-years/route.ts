import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLE } from "@/lib/constants";
import { getAcademicYears, getAcademicYearsBySchool, createAcademicYear } from "@/lib/features/academic-years/academic-year-actions";
import { academicYearSchema } from "@/lib/features/academic-years/schemas/academic-year.schema";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === ADMIN_ROLE) {
    const years = await getAcademicYears();
    return NextResponse.json(years);
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ error: "No school assigned" }, { status: 403 });
  }

  const years = await getAcademicYearsBySchool(session.user.schoolId);
  return NextResponse.json(years);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = academicYearSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (session.user.role !== ADMIN_ROLE && parsed.data.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const year = await createAcademicYear(parsed.data);
    return NextResponse.json(year, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school does not exist" }, { status: 400 });
    }
    throw err;
  }
}
