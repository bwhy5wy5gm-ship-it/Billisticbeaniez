import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail, ADMIN_TO } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json().catch(() => ({}));
  if (!name || !email || !message) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }
  await prisma.accessLog
    .create({ data: { page: "contact", visitorId: email } })
    .catch(() => {});
  try {
    await sendContactEmail({ name, email, message });
  } catch (emailError) {
    console.error("Contact email failed:", emailError);
    return NextResponse.json(
      {
        error: `Could not send your message. Please email us directly at ${ADMIN_TO}.`,
      },
      { status: 502 }
    );
  }
  return NextResponse.json({ success: true });
}
