import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const VIDEO_ORDER_KEY = "videoOrder";

export const videoSelect = {
  id: true,
  title: true,
  category: true,
  thumb: true,
  yt: true,
  mp4: true
} satisfies Prisma.VideoSelect;

export const parseVideoOrder = (value?: string | null) => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
};

export const serializeVideoOrder = (ids: string[]) => JSON.stringify(Array.from(new Set(ids)));

export const applyVideoOrder = <T extends { id: string }>(videos: T[], savedOrder: string[]) => {
  if (savedOrder.length === 0) return videos;

  const savedIndex = new Map(savedOrder.map((id, index) => [id, index]));
  const newVideos: T[] = [];
  const orderedVideos: T[] = [];

  videos.forEach((video) => {
    if (savedIndex.has(video.id)) {
      orderedVideos.push(video);
    } else {
      newVideos.push(video);
    }
  });

  orderedVideos.sort((left, right) => {
    return (savedIndex.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (savedIndex.get(right.id) ?? Number.MAX_SAFE_INTEGER);
  });

  return [...newVideos, ...orderedVideos];
};

export const getOrderedVideos = async () => {
  const [videos, orderSetting] = await Promise.all([
    prisma.video.findMany({
      select: videoSelect,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }]
    }),
    prisma.siteSetting.findUnique({
      where: { key: VIDEO_ORDER_KEY },
      select: { value: true }
    })
  ]);

  return applyVideoOrder(videos, parseVideoOrder(orderSetting?.value));
};
