import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  deleteSchool,
  getSchoolById,
  updateSchool,
} from "@/lib/services/school.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        {
          error: "School name is required",
        },
        {
          status: 400,
        }
      );
    }

    const school = await getSchoolById(id);

    if (!school) {
      return NextResponse.json(
        {
          error: "School not found",
        },
        {
          status: 404,
        }
      );
    }

    await updateSchool(id, name);

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

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const school = await getSchoolById(id);

    if (!school) {
      return NextResponse.json(
        {
          error: "School not found",
        },
        {
          status: 404,
        }
      );
    }

    await deleteSchool(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Delete failed",
      },
      {
        status: 500,
      }
    );
  }
}