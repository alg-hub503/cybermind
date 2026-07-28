import { permanentRedirect, redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";

export default async function UsersRedirectPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  permanentRedirect("/dashboard/admin");
}
