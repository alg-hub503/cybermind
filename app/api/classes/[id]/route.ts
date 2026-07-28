import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-server-session";

import { ADMIN_ROLE } from "@/lib/constants";
import { getClass, updateClass, deleteClass } from "@/lib/features/classes/class-actions";
import { updateClassSchema } from "@/lib/features/classes/schemas/class.schema";

async function requireAccess(classId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const };
  }

  if (session.user.role === ADMIN_ROLE) {
    return { session };
  }

  const classe = await getClass(classId);
  if (!classe) {
    return { error: "Not found", status: 404 as const };
  }

  if (classe.schoolId !== session.user.schoolId) {
    return { error: "Forbidden", status: 403 as const };
  }

  return { session };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireAccess(id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const classe = await getClass(id);
  return NextResponse.json(classe);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireAccess(id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = await req.json();
  const parsed = updateClassSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.schoolId && access.session.user.role !== ADMIN_ROLE && parsed.data.schoolId !== access.session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const classe = await updateClass(id, parsed.data);
    return NextResponse.json(classe);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A class with this code or name already exists in this school/grade/year" }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireAccess(id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  await deleteClass(id);
  return NextResponse.json({ success: true });
}
