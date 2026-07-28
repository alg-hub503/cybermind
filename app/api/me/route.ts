import { getServerSession } from "@/lib/get-server-session";
import { NextResponse } from "next/server";


export async function GET() {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(null);
  }

  return NextResponse.json(session.user);
}