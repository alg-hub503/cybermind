import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getUsers } from "@/lib/services/user.service";

export async function GET() {
  try {
    await requireAdmin();

    const users = await getUsers();

    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      {
        error: "Forbidden",
      },
      {
        status: 403,
      }
    );
  }
}