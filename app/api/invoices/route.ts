import { NextResponse } from "next/server";
import { requireAuth, toApiError } from "@/lib/authorization";

import { ADMIN_ROLE } from "@/lib/constants";
import { getInvoices, createInvoice } from "@/lib/features/invoices/invoice-actions";
import { invoiceSchema } from "@/lib/features/invoices/schemas/invoice.schema";

export async function GET() {
  const access = await requireAuth().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

  if (session.user.role === ADMIN_ROLE) {
    const invoices = await getInvoices();
    return NextResponse.json(invoices);
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ error: "No school assigned" }, { status: 403 });
  }

  const { getInvoicesBySchool } = await import("@/lib/features/invoices/invoice-actions");
  const invoices = await getInvoicesBySchool(session.user.schoolId);
  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  const access = await requireAuth().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

  const body = await req.json();
  const parsed = invoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (session.user.role !== ADMIN_ROLE && parsed.data.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const invoice = await createInvoice(parsed.data);
    return NextResponse.json(invoice, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Exactly one of clientId or studentId is required") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof Error && err.name === "DUPLICATE_INVOICE") {
      return NextResponse.json({ error: "DUPLICATE_INVOICE" }, { status: 409 });
    }
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced client or school does not exist" }, { status: 400 });
    }
    throw err;
  }
}
