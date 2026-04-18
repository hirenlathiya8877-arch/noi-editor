import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await prisma.contactSubmission.create({
      data: {
        name: body.name,
        email: body.email,
        projectType: body.projectType || null,
        message: body.message
      }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit contact request", details: String(error) },
      { status: 400 }
    );
  }
}
