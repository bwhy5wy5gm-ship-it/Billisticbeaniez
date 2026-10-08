import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PRIMARY_ADMIN = "admin@billisticbeaniez.com";

export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email || email !== PRIMARY_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const logins = await prisma.accessLog.findMany({
      where: { page: "login" },
      take: 100,
    });
    return NextResponse.json({ logins });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
