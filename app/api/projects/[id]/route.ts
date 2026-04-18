import { ProjectStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toStatus(status?: string): ProjectStatus | undefined {
  if (!status) return undefined;
  if (status === "IN_PROGRESS") return ProjectStatus.IN_PROGRESS;
  if (status === "REVIEW") return ProjectStatus.REVIEW;
  if (status === "DONE") return ProjectStatus.DONE;
  if (status === "PENDING") return ProjectStatus.PENDING;
  return undefined;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        title: body.title,
        status: toStatus(body.status),
        video: body.video ?? undefined,
        notes: body.notes ?? undefined,
        clientId: body.clientId ?? undefined
      },
      include: { client: true }
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update project", details: String(error) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.project.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project", details: String(error) }, { status: 400 });
  }
}
