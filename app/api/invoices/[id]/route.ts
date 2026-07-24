import { NextRequest, NextResponse } from "next/server";
import { getInvoice, updateInvoice, deleteInvoice } from "@/lib/features/invoices/invoice-actions";
import { invoiceSchema } from "@/lib/features/invoices/schemas/invoice.schema";

const updateInvoiceSchema = invoiceSchema.partial();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const invoice = await updateInvoice(id, parsed.data);
    return NextResponse.json(invoice);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced client or school does not exist" }, { status: 400 });
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteInvoice(id);
  return NextResponse.json({ success: true });
}
