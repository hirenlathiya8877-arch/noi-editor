import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const normalizeYouTubeId = (value: unknown) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }
    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || "";
    }
  } catch {
    // Plain YouTube IDs are not URLs, so keep them as entered.
  }

  return trimmed;
};

const isDatabaseUnavailable = (error: unknown) =>
  /can't reach database server|connect.*database|localhost:5432|p1001|econnrefused|tls connection|security package|channel_binding/i.test(
    String(error)
  );

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: "asc" }
    });
    return NextResponse.json(videos);
  } catch (error) {
    const status = isDatabaseUnavailable(error) ? 503 : 500;
    return NextResponse.json({ error: "Failed to load videos", details: String(error) }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const category = typeof body.category === "string" && body.category.trim() ? body.category.trim() : "short";
    const yt = normalizeYouTubeId(body.yt);
    const mp4 = typeof body.mp4 === "string" ? body.mp4.trim() : "";
    const thumb = typeof body.thumb === "string" ? body.thumb.trim() : "";

    if (!title) {
      return NextResponse.json({ error: "Video title is required" }, { status: 400 });
    }
    if (!yt && !mp4) {
      return NextResponse.json({ error: "Add a YouTube link/ID or MP4 URL" }, { status: 400 });
    }

    const video = await prisma.video.create({
      data: {
        title,
        category,
        thumb: thumb || null,
        yt: yt || null,
        mp4: mp4 || null
      }
    });
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    const status = isDatabaseUnavailable(error) ? 503 : 400;
    return NextResponse.json({ error: "Failed to create video", details: String(error) }, { status });
  }
}
