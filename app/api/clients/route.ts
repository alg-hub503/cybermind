import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  createClient,
  getClients,
  updateClient,
} from "@/lib/services/client.service";

import {
  CreateClientSchema,
  UpdateClientSchema,
} from "@/lib/validators/client";

async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  let user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return null;
  }

  if (!user.schoolId) {
    const school = await prisma.school.create({
      data: {
        name: "Default School",
      },
    });

    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        schoolId: school.id,
      },
    });
  }

  return user;
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.schoolId) {
    return NextResponse.json([]);
  }

  const clients = await getClients(user.schoolId);

  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user?.schoolId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = CreateClientSchema.parse(
      await request.json()
    );

    const client = await createClient({
      name: body.name,
      schoolId: user.schoolId,
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Invalid request",
      },
      {
        status: 400,
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user?.schoolId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = UpdateClientSchema.parse(
      await request.json()
    );

    const existingClient = await prisma.client.findFirst({
      where: {
        id: body.id,
        schoolId: user.schoolId,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        {
          error: "Client not found",
        },
        {
          status: 404,
        }
      );
    }

    const client = await updateClient(body.id, {
      name: body.name,
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Invalid request",
      },
      {
        status: 400,
      }
    );
  }
}