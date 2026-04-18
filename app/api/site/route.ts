import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultFaqs } from "@/lib/default-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [videos, testimonials, logo] = await Promise.all([
      prisma.video.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.testimonial.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.siteSetting.findUnique({ where: { key: "logo" } })
    ]);

    return NextResponse.json({
      videos,
      testimonials,
      faqs: defaultFaqs,
      logo: logo?.value || ""
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
