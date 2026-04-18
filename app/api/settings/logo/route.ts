import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logo = await prisma.siteSetting.findUnique({
    where: { key: "logo" }
  });
  return NextResponse.json({ value: logo?.value || "" });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const saved = await prisma.siteSetting.upsert({
      where: { key: "logo" },
      update: { value: body.value || "" },
      create: {
        key: "logo",
        value: body.value || ""
      }
    });
    return NextResponse.json(saved);
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
