import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminApprovedEmail, sendAdminDeniedEmail } from "@/lib/email";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const currentUser = session?.user as { isAdmin?: boolean } | null | undefined;
    if (!currentUser?.isAdmin) {
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
      const existingUser = await prisma.user.findUnique({
        where: { email: signupRequest.email },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "That email already has an account" },
          { status: 400 }
        );
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
      let emailSent = true;
      try {
        await sendAdminApprovedEmail({
          name: signupRequest.name,
          email: signupRequest.email,
        });
      } catch (emailError) {
        emailSent = false;
        console.error("Approval email failed:", emailError);
      }
      return NextResponse.json({ success: true, emailSent });
    } else {
      await prisma.adminSignupRequest.update({
        where: { id: requestId },
        data: { status: "denied" },
      });
      let emailSent = true;
      try {
        await sendAdminDeniedEmail({
          name: signupRequest.name,
          email: signupRequest.email,
        });
      } catch (emailError) {
        emailSent = false;
        console.error("Denial email failed:", emailError);
      }
      return NextResponse.json({ success: true, emailSent });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
