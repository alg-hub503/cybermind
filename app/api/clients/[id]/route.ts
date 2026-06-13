import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: any) {
  const body = await req.json();

  const client = await prisma.client.update({
    where: { id: params.id },
    data: body,
  });

  return Response.json(client);
}

export async function DELETE(_: Request, { params }: any) {
  await prisma.client.delete({
    where: { id: params.id },
  });

  return Response.json({ ok: true });
}