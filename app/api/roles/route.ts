import { NextResponse } from "next/server";
import { requireAdmin, toApiError } from "@/lib/authorization";
import { getRoles, createRole } from "@/lib/features/roles/role-actions";
import { createRoleSchema } from "@/lib/features/roles/schemas/role.schema";

export async function GET() {
  const access = await requireAdmin().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  const roles = await getRoles();
  return NextResponse.json(roles);
}

export async function POST(req: Request) {
  const access = await requireAdmin().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  const body = await req.json();
  const parsed = createRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const role = await createRole(parsed.data);
    return NextResponse.json(role, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }
    throw err;
  }
}
