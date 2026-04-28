import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const created = await prisma.contactSubmission.create({
      data: {
        name: body.name,
        email: body.email,
        projectType: body.projectType || null,
        message: body.message
      }
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"NOI EDITORS" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `🔥 New Inquiry from ${body.name}`,
      html: `
        <h2>New Project Inquiry</h2>
        <p><b>Name:</b> ${body.name}</p>
        <p><b>Email:</b> ${body.email}</p>
        <p><b>Project Type:</b> ${body.projectType || "Not specified"}</p>
        <p><b>Message:</b><br/>${body.message}</p>
      `,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit", details: String(error) },
      { status: 400 }
    );
  }
}