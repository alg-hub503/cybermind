import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-server-session";

import { ADMIN_ROLE } from "@/lib/constants";
import { getClients, getClientsBySchool, createClient } from "@/lib/features/clients/client-actions";
import { clientSchema } from "@/lib/features/clients/schemas/client.schema";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === ADMIN_ROLE) {
    const clients = await getClients();
    return NextResponse.json(clients);
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ error: "No school assigned" }, { status: 403 });
  }

  const clients = await getClientsBySchool(session.user.schoolId);
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = clientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (session.user.role !== ADMIN_ROLE && parsed.data.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const client = await createClient(parsed.data);
    return NextResponse.json(client, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school does not exist" }, { status: 400 });
    }
    throw err;
  }
}
