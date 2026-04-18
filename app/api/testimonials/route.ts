import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json(testimonials);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        sub: body.sub || "",
        text: body.text,
        avatar: body.avatar || body.name?.slice(0, 2)?.toUpperCase() || "NE"
      }
    });
    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create testimonial", details: String(error) },
      { status: 400 }
    );
  }
}
