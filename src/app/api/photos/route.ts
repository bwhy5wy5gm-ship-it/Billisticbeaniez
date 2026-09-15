import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const items = prisma.photoLog.findMany();
    const parsed = items.map((p: any) => ({
      ...p,
      photos: JSON.parse(p.photos || "[]"),
    }));
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
    const { title, description, date, photos } = await req.json();
    if (!title || !date) {
      return NextResponse.json({ error: "Title and date required" }, { status: 400 });
    }
    const item = prisma.photoLog.create({
      data: { title, description: description || "", date, photos: photos || [] },
    });
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
