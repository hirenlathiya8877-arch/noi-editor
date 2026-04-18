import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "");
    const password = String(body.password || "");
    const tab = String(body.tab || "client");

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "noi2026";

    if (tab === "admin") {
      if (username === adminUsername && password === adminPassword) {
        return NextResponse.json({
          ok: true,
          role: "admin"
        });
      }
      return NextResponse.json({ ok: false, error: "Invalid admin credentials" }, { status: 401 });
    }

    const client = await prisma.client.findFirst({
      where: {
        username,
        password
      }
    });

    if (!client) {
      return NextResponse.json({ ok: false, error: "Invalid client credentials" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      role: "client",
      clientId: client.id,
      clientName: client.name,
      username: client.username
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Login failed", details: String(error) }, { status: 400 });
  }
}
