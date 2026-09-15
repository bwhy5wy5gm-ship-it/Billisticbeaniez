import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    await sendContactEmail({ name, email, message });
    await prisma.accessLog.create({
      data: { page: "contact", visitorId: email },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
