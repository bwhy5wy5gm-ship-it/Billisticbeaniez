import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { currentPassword, newPassword } = await req.json().catch(() => ({}));
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.hashedPassword) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    const valid = await bcrypt.compare(String(currentPassword), user.hashedPassword);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(String(newPassword), 12);
    await prisma.user.update({ where: { id: user.id }, data: { hashedPassword } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
