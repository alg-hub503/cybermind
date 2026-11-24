import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/require-current-user";
import { usersHomePath } from "@/lib/users-home-path";

// A temporary (307) redirect on purpose: where this goes depends on WHO is
// asking (platform admin -> /dashboard/admin, school user -> their school's
// users page), and a permanent 308 is cached by browsers and would pin
// everyone to the first answer they ever got.
export default async function UsersRedirectPage() {
  const { user } = await requireCurrentUser();

  redirect(usersHomePath(user));
}
