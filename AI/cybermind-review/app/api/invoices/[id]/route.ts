import { NextResponse } from "next/server";

import {
  deleteInvoice,
  getInvoiceById,
} from "@/lib/services/invoice.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const invoice = await getInvoiceById(id);

    if (!invoice) {
      return NextResponse.json(
        {
          error: "Invoice not found",
        },
        {
          status: 404,
        }
      );
    }

    await deleteInvoice(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Delete failed",
      },
      {
        status: 500,
      }
    );
  }
}