import { NextResponse } from "next/server";
import { requireSession, toApiError } from "@/lib/authorization";

import { ADMIN_ROLE } from "@/lib/constants";
import { getClients, getClientsBySchool, createClient } from "@/lib/features/clients/client-actions";
import { clientSchema } from "@/lib/features/clients/schemas/client.schema";

export async function GET() {
  const access = await requireSession().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

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
  const access = await requireSession().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

  const body = await req.json();
  const parsed = clientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  // Security: School Users MUST use their own schoolId from session
  // Only ADMIN can specify schoolId from the request body
  let schoolId: string;
  if (session.user.role === ADMIN_ROLE) {
    // ADMIN: accept schoolId from body, but verify it's a real school
    schoolId = parsed.data.schoolId;
  } else {
    // School User: IGNORE body schoolId, force use session schoolId
    if (!session.user.schoolId) {
      return NextResponse.json({ error: "No school assigned" }, { status: 403 });
    }
    schoolId = session.user.schoolId;
  }

  try {
    const client = await createClient({ name: parsed.data.name, schoolId });
    return NextResponse.json(client, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school does not exist" }, { status: 400 });
    }
    throw err;
  }
}
