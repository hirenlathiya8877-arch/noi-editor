import { NextResponse } from "next/server";
import { normalizeImageUrl } from "@/lib/image-url";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const logo = await prisma.siteSetting.findUnique({
    where: { key: "logo" }
  });
  return NextResponse.json({ value: normalizeImageUrl(logo?.value || "") });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const value = normalizeImageUrl(typeof body.value === "string" ? body.value : "");
    const saved = await prisma.siteSetting.upsert({
      where: { key: "logo" },
      update: { value },
      create: {
        key: "logo",
        value
      }
    });
    return NextResponse.json({ value: saved.value });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save logo", details: String(error) }, { status: 400 });
  }
}

export async function DELETE() {
  const saved = await prisma.siteSetting.upsert({
    where: { key: "logo" },
    update: { value: "" },
    create: {
      key: "logo",
      value: ""
    }
  });
  return NextResponse.json(saved);
}
