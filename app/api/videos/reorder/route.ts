import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrderedVideos, serializeVideoOrder, VIDEO_ORDER_KEY } from "@/lib/video-order";

export const dynamic = "force-dynamic";

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
      select: { id: true },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }]
    });
    const existingIds = existingVideos.map((video) => video.id);
    const existingIdSet = new Set(existingIds);

    if (uniqueIds.some((id) => !existingIdSet.has(id))) {
      return NextResponse.json({ error: "Video order contains an unknown video" }, { status: 400 });
    }

    const nextOrder = [...uniqueIds, ...existingIds.filter((id) => !uniqueIds.includes(id))];
    await prisma.siteSetting.upsert({
      where: { key: VIDEO_ORDER_KEY },
      update: { value: serializeVideoOrder(nextOrder) },
      create: { key: VIDEO_ORDER_KEY, value: serializeVideoOrder(nextOrder) }
    });

    const videos = await getOrderedVideos();
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save video order", details: String(error) }, { status: 400 });
  }
}
