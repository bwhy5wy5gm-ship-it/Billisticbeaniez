import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DEFAULT_CONFIG, normalizeConfig } from "@/lib/planner/defaults";

const KEY = "planner.config";

async function readConfig() {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: KEY } });
    if (!row || !row.value) return DEFAULT_CONFIG;
    return normalizeConfig(JSON.parse(row.value));
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function GET() {
  try {
    const res = NextResponse.json(await readConfig());
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res;
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as { isAdmin?: boolean } | undefined;
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const config = normalizeConfig(body?.config ?? body);
    await prisma.siteContent.upsert({
      where: { key: KEY },
      update: { value: JSON.stringify(config) },
      create: { key: KEY, value: JSON.stringify(config) },
    });
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
