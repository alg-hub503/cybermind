import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-server-session";

import { ADMIN_ROLE } from "@/lib/constants";
import { getClient, updateClient, deleteClient } from "@/lib/features/clients/client-actions";
import { clientSchema } from "@/lib/features/clients/schemas/client.schema";

const updateClientSchema = clientSchema.partial();

async function requireAccess(clientId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const };
  }

  if (session.user.role === ADMIN_ROLE) {
    return { session };
  }

  const client = await getClient(clientId);
  if (!client) {
    return { error: "Not found", status: 404 as const };
  }

  if (client.schoolId !== session.user.schoolId) {
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

  const client = await getClient(id);
  return NextResponse.json(client);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireAccess(id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = await req.json();
  const parsed = updateClientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.schoolId && access.session.user.role !== ADMIN_ROLE && parsed.data.schoolId !== access.session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const client = await updateClient(id, parsed.data);
    return NextResponse.json(client);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school does not exist" }, { status: 400 });
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

  await deleteClient(id);
  return NextResponse.json({ success: true });
}
