import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json(videos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const video = await prisma.video.create({
      data: {
        title: body.title,
        category: body.category,
        thumb: body.thumb || null,
        yt: body.yt || null,
        mp4: body.mp4 || null
      }
    });
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create video", details: String(error) }, { status: 400 });
  }
}
