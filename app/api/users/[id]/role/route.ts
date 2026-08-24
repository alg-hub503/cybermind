import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, toApiError } from "@/lib/authorization";
import { getUserById, updateUserRole } from "@/lib/services/user.service";

const ADMIN_ROLE = "ADMIN";
const USER_ROLE = "USER";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const access = await requireAdmin().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  if (access.user.id === id) {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  const targetUser = await getUserById(id);
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const newRole = targetUser.role === ADMIN_ROLE ? USER_ROLE : ADMIN_ROLE;

  try {
    const updated = await updateUserRole(id, newRole);
    return NextResponse.json({ role: updated.role });
  } catch {
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
