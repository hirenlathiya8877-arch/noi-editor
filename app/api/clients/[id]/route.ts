import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        name: body.name,
        username: body.username,
        password: body.password
      }
    });
    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update client", details: String(error) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.client.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete client", details: String(error) }, { status: 400 });
  }
}
