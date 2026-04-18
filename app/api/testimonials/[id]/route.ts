import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const testimonial = await prisma.testimonial.update({
      where: { id: params.id },
      data: {
        name: body.name,
        sub: body.sub,
        text: body.text,
        avatar: body.avatar
      }
    });
    return NextResponse.json(testimonial);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update testimonial", details: String(error) },
      { status: 400 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.testimonial.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete testimonial", details: String(error) },
      { status: 400 }
    );
  }
}
