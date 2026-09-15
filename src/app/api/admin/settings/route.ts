import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const settings = prisma.siteSettings.findMany();
    const obj: Record<string, string> = {};
    settings.forEach((s: any) => { obj[s.key] = s.value; });
    return NextResponse.json({ settings: obj });
  } catch {
    return NextResponse.json({ settings: {} });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const settings = body.settings as Record<string, string>;
    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    for (const [key, value] of Object.entries(settings)) {
      prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
