import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const items = await prisma.teamHistory.findMany();
    const parsed = items.map((h: any) => ({ ...h, photos: JSON.parse(h.photos || "[]") }));
    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { year, title, description, photos } = await req.json();
    if (!year || !title || !description) {
      return NextResponse.json({ error: "Year, title, and description required" }, { status: 400 });
    }
    const item = await prisma.teamHistory.create({
      data: { year: Number(year), title, description, photos: photos || [] },
    });
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
