import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
const schools = await prisma.school.findMany({
orderBy: {
createdAt: "desc",
},
});

return NextResponse.json(schools);
}

export async function POST(req: Request) {
const body = await req.json();

const school = await prisma.school.create({
data: {
name: body.name,
},
});

return NextResponse.json(school);
}
