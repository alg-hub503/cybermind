import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  requireResourceAccess,
  toApiError,
} from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { getInvoice, updateInvoice, deleteInvoice } from "@/lib/features/invoices/invoice-actions";

const updateInvoiceSchema = z.object({
  amount: z.number().positive().optional(),
  schoolId: z.string().min(1).optional(),
  clientId: z.string().min(1).optional(),
  studentId: z.string().min(1).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const invoice = await getInvoice(id);
  const access = await requireResourceAccess(invoice).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json(invoice);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const invoice = await getInvoice(id);
  const access = await requireResourceAccess(invoice).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = await req.json();
  const parsed = updateInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.schoolId && access.user.role !== ADMIN_ROLE && parsed.data.schoolId !== access.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updated = await updateInvoice(id, parsed.data);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Cannot change invoice ownership type after creation.") {
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const invoice = await getInvoice(id);
  const access = await requireResourceAccess(invoice).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  await deleteInvoice(id);
  return NextResponse.json({ success: true });
}
