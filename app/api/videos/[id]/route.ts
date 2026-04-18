import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const video = await prisma.video.update({
      where: { id: params.id },
      data: {
        title: body.title,
        category: body.category,
        thumb: body.thumb ?? null,
        yt: body.yt ?? null,
        mp4: body.mp4 ?? null
      }
    });
    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update video", details: String(error) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.video.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete video", details: String(error) }, { status: 400 });
  }
}
