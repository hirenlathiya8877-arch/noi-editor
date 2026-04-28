import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseVideoOrder, serializeVideoOrder, VIDEO_ORDER_KEY, videoSelect } from "@/lib/video-order";

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
      },
      select: videoSelect
    });
    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update video", details: String(error) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.video.delete({
        where: { id: params.id }
      });

      const orderSetting = await tx.siteSetting.findUnique({
        where: { key: VIDEO_ORDER_KEY },
        select: { value: true }
      });
      const savedOrder = parseVideoOrder(orderSetting?.value);
      const nextOrder = savedOrder.filter((id) => id !== params.id);

      if (orderSetting && nextOrder.length !== savedOrder.length) {
        await tx.siteSetting.update({
          where: { key: VIDEO_ORDER_KEY },
          data: { value: serializeVideoOrder(nextOrder) }
        });
      }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete video", details: String(error) }, { status: 400 });
  }
}
