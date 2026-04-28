import { NextResponse } from "next/server";
import { defaultFaqs } from "@/lib/default-data";
import { normalizeImageUrl } from "@/lib/image-url";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [videos, testimonials, logo] = await Promise.all([
      prisma.video.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
      prisma.testimonial.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.siteSetting.findUnique({ where: { key: "logo" } })
    ]);

    return NextResponse.json({
      videos,
      testimonials,
      faqs: defaultFaqs,
      logo: normalizeImageUrl(logo?.value || "")
    });
  } catch (error) {
    console.error("Database connection error:", error);
    // Return default data when database is unavailable
    return NextResponse.json({
      videos: [],
      testimonials: [],
      faqs: defaultFaqs,
      logo: ""
    });
  }
}
