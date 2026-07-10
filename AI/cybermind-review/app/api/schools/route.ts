import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createSchool,
  getSchoolByName,
} from "@/lib/services/school.service";

export async function POST(request: Request) {
  try {
    await requireAdmin();

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

    const existingSchool =
      await getSchoolByName(name);

    if (existingSchool) {
      return NextResponse.json(
        {
          error: "School already exists",
        },
        {
          status: 409,
        }
      );
    }

    const school = await createSchool(name);

    return NextResponse.json(school, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}