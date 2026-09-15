import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const logs = await prisma.accessLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
    });
    const totalVisitors = await prisma.accessLog.groupBy({
      by: ["visitorId"],
      _count: true,
    });
    const pageViews = await prisma.accessLog.groupBy({
      by: ["page"],
      _count: true,
    });
    return NextResponse.json({
      logs,
      stats: {
        totalVisitors: totalVisitors.length,
        totalPageViews: logs.length,
        pageViews: pageViews.map((p) => ({ page: p.page, count: p._count })),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { page, visitorId } = await req.json();
    await prisma.accessLog.create({
      data: { page, visitorId, userAgent: req.headers.get("user-agent") || "" },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
