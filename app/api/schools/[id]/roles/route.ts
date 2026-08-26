import { NextResponse } from "next/server";
import { requireSchoolAdmin, toApiError } from "@/lib/authorization";
import { getRolesBySchoolId, createRole } from "@/lib/features/roles/role-actions";
import { createRoleSchema } from "@/lib/features/roles/schemas/role.schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const access = await requireSchoolAdmin(id).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  const roles = await getRolesBySchoolId(id);
  return NextResponse.json(roles);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const access = await requireSchoolAdmin(id).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  const body = await req.json();
  const parsed = createRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  // Add schoolId from URL (server-side, not from client)
  try {
    const role = await createRole({ ...parsed.data, schoolId: id });
    return NextResponse.json(role, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A role with this name already exists in this school" }, { status: 409 });
    }
    throw err;
  }
}
