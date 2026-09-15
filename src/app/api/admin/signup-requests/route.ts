import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminSignupRequest } from "@/lib/email";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const requests = await prisma.adminSignupRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, reason } = await req.json();
    if (!name || !email || !reason) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    const existing = await prisma.adminSignupRequest.findFirst({
      where: { email, status: "pending" },
    });
    if (existing) {
      return NextResponse.json({ error: "Request already pending" }, { status: 400 });
    }
    const request = await prisma.adminSignupRequest.create({
      data: { name, email, reason },
    });
    await sendAdminSignupRequest({ name, email, reason, requestId: request.id });
    return NextResponse.json({ success: true, id: request.id });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
