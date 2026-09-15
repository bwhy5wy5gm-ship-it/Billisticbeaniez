import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminApprovedEmail, sendAdminDeniedEmail } from "@/lib/email";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, action, password } = await req.json();
    const signupRequest = await prisma.adminSignupRequest.findUnique({
      where: { id: requestId },
    });

    if (!signupRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "approve") {
      if (!password) {
        return NextResponse.json({ error: "Password required" }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.create({
        data: {
          name: signupRequest.name,
          email: signupRequest.email,
          hashedPassword,
          isAdmin: true,
          role: "admin",
        },
      });
      await prisma.adminSignupRequest.update({
        where: { id: requestId },
        data: { status: "approved" },
      });
      await sendAdminApprovedEmail({
        name: signupRequest.name,
        email: signupRequest.email,
      });
      return NextResponse.json({ success: true });
    } else {
      await prisma.adminSignupRequest.update({
        where: { id: requestId },
        data: { status: "denied" },
      });
      await sendAdminDeniedEmail({
        name: signupRequest.name,
        email: signupRequest.email,
      });
      return NextResponse.json({ success: true });
    }
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
