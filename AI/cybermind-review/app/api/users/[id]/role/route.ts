import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  getUserById,
  updateUserRole,
} from "@/lib/services/user.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  _request: Request,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const newRole =
      user.role === "ADMIN"
        ? "USER"
        : "ADMIN";

    await updateUserRole(id, newRole);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Update failed",
      },
      {
        status: 500,
      }
    );
  }
}