import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const orderedVideosQuery = {
  orderBy: [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }]
};

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body.ids)
      ? body.ids.filter((id: unknown): id is string => typeof id === "string" && id.trim().length > 0)
      : [];
    const uniqueIds = Array.from(new Set<string>(ids));

    if (ids.length === 0) {
      return NextResponse.json({ error: "Video order is required" }, { status: 400 });
    }

    if (uniqueIds.length !== ids.length) {
      return NextResponse.json({ error: "Video order cannot contain duplicate videos" }, { status: 400 });
    }

    const existingVideos = await prisma.video.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true }
    });

    if (existingVideos.length !== uniqueIds.length) {
      return NextResponse.json({ error: "Video order contains an unknown video" }, { status: 400 });
    }

    await prisma.$transaction(
      uniqueIds.map((id, sortOrder) =>
        prisma.video.update({
          where: { id },
          data: { sortOrder }
        })
      )
    );

    const videos = await prisma.video.findMany(orderedVideosQuery);
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save video order", details: String(error) }, { status: 400 });
  }
}
