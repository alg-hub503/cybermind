import { NextResponse } from "next/server";
import { getClients, createClient } from "@/lib/features/clients/client-actions";
import { clientSchema } from "@/lib/features/clients/schemas/client.schema";
import { Client } from "@/lib/features/clients/types/client";

export async function GET() {
  const clients: Client[] = await getClients();
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
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
