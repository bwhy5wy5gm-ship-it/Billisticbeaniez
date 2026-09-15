import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const contents = await prisma.siteContent.findMany();
  const obj: Record<string, string> = {};
  contents.forEach((c) => { obj[c.key] = c.value; });
  return NextResponse.json(obj);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { key, value } = await req.json();
    await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
