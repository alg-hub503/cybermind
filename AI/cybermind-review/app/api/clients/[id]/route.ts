import { NextResponse } from "next/server";

import { deleteClient } from "@/lib/services/client.service";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await deleteClient(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to delete client",
      },
      {
        status: 500,
      }
    );
  }
}