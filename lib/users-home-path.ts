import { ADMIN_ROLE } from "@/lib/constants";

/**
 * Where "the users page" is for a given viewer.
 *
 * There is no single global users page: a platform ADMIN manages everyone
 * from /dashboard/admin (which is ADMIN-only), while a school user manages
 * their own school's people from /dashboard/schools/[id]/users. Linking
 * everyone to /dashboard/admin is what made a school owner's "Manage users"
 * button and the user-detail "back" link end in a server error.
 */
export function usersHomePath(user: {
  role: string;
  schoolId: string | null;
}): string {
  if (user.role === ADMIN_ROLE) {
    return "/dashboard/admin";
  }

  if (user.schoolId) {
    return `/dashboard/schools/${user.schoolId}/users`;
  }

  return "/dashboard";
}
