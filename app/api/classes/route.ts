import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLE } from "@/lib/constants";
import { getClasses, getClassesBySchool, createClass } from "@/lib/features/classes/class-actions";
import { classSchema } from "@/lib/features/classes/schemas/class.schema";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === ADMIN_ROLE) {
    const classes = await getClasses();
    return NextResponse.json(classes);
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ error: "No school assigned" }, { status: 403 });
  }

  const classes = await getClassesBySchool(session.user.schoolId);
  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = classSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (session.user.role !== ADMIN_ROLE && parsed.data.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const classe = await createClass(parsed.data);
    return NextResponse.json(classe, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A class with this code or name already exists in this school/grade/year" }, { status: 409 });
    }
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school, grade, or academic year does not exist" }, { status: 400 });
    }
    throw err;
  }
}
