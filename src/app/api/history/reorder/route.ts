import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { ordered } = await req.json();
    if (!Array.isArray(ordered)) {
      return NextResponse.json({ error: "ordered array required" }, { status: 400 });
    }
    await Promise.all(
      ordered.map((item: { id: string; position: number }, i: number) =>
        prisma.teamHistory.update({ where: { id: item.id }, data: { position: item.position ?? i } })
      )
    );
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
