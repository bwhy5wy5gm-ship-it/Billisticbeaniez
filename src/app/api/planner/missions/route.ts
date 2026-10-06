import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DEFAULT_MISSIONS } from "@/lib/planner/missions";

const KEY = "planner.missions";

async function readMissions() {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: KEY } });
    if (!row || !row.value) return DEFAULT_MISSIONS;
    const parsed = JSON.parse(row.value);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_MISSIONS;
    return parsed;
  } catch {
    return DEFAULT_MISSIONS;
  }
}

export async function GET() {
  try {
    return NextResponse.json(await readMissions());
  } catch {
    return NextResponse.json(DEFAULT_MISSIONS);
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
    const missions = body?.missions ?? body;
    if (!Array.isArray(missions) || missions.length === 0) {
      return NextResponse.json({ error: "Missions array required" }, { status: 400 });
    }
    const value = JSON.stringify(missions);
    if (value.length > 400000) {
      return NextResponse.json({ error: "Mission data too large" }, { status: 413 });
    }
    await prisma.siteContent.upsert({
      where: { key: KEY },
      update: { value },
      create: { key: KEY, value },
    });
    return NextResponse.json(missions);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    const user = session?.user as { isAdmin?: boolean } | undefined;
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.siteContent.upsert({
      where: { key: KEY },
      update: { value: JSON.stringify(DEFAULT_MISSIONS) },
      create: { key: KEY, value: JSON.stringify(DEFAULT_MISSIONS) },
    });
    return NextResponse.json(DEFAULT_MISSIONS);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
