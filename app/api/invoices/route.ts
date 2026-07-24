import { NextResponse } from "next/server";
import { getInvoices, createInvoice } from "@/lib/features/invoices/invoice-actions";
import { invoiceSchema } from "@/lib/features/invoices/schemas/invoice.schema";
import { Invoice } from "@/lib/features/invoices/types/invoice";

export async function GET() {
  const invoices: Invoice[] = await getInvoices();
  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const invoice = await createInvoice(parsed.data);
    return NextResponse.json(invoice, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced client or school does not exist" }, { status: 400 });
    }
    throw err;
  }
}
