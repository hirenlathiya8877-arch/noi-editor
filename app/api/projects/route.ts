import { ProjectStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toStatus(status?: string): ProjectStatus {
  if (!status) return ProjectStatus.PENDING;
  if (status === "IN_PROGRESS") return ProjectStatus.IN_PROGRESS;
  if (status === "REVIEW") return ProjectStatus.REVIEW;
  if (status === "DONE") return ProjectStatus.DONE;
  return ProjectStatus.PENDING;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId");

  const projects = await prisma.project.findMany({
    where: clientId ? { clientId } : undefined,
    include: { client: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const project = await prisma.project.create({
      data: {
        title: body.title,
        status: toStatus(body.status),
        video: body.video || null,
        notes: body.notes || null,
        clientId: body.clientId
      },
      include: { client: true }
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project", details: String(error) }, { status: 400 });
  }
}
