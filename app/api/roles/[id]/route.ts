import { NextResponse } from "next/server";
import { requireAdmin, toApiError } from "@/lib/authorization";
import { getRole, updateRole, deleteRole } from "@/lib/features/roles/role-actions";
import { updateRoleSchema } from "@/lib/features/roles/schemas/role.schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAdmin().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { id } = await params;

  const role = await getRole(id);

  if (!role) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(role);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAdmin().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { id } = await params;

  const role = await getRole(id);

  if (!role) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await updateRole(id, parsed.data);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAdmin().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { id } = await params;

  const role = await getRole(id);

  if (!role) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (role.isDefault) {
    return NextResponse.json({ error: "Cannot delete default role" }, { status: 400 });
  }

  await deleteRole(id);
  return NextResponse.json({ success: true });
}
