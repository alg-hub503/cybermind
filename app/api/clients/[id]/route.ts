import { NextRequest, NextResponse } from "next/server";

import {
  requireResourceAccess,
  toApiError,
} from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { getClient, updateClient, deleteClient } from "@/lib/features/clients/client-actions";
import { clientSchema } from "@/lib/features/clients/schemas/client.schema";

const updateClientSchema = clientSchema.partial();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await getClient(id);
  const access = await requireResourceAccess(client).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json(client);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await getClient(id);
  const access = await requireResourceAccess(client).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = await req.json();
  const parsed = updateClientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.schoolId && access.user.role !== ADMIN_ROLE && parsed.data.schoolId !== access.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updated = await updateClient(id, parsed.data);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school does not exist" }, { status: 400 });
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await getClient(id);
  const access = await requireResourceAccess(client).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  await deleteClient(id);
  return NextResponse.json({ success: true });
}
