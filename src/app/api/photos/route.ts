import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const group = searchParams.get("group");

    const items = await prisma.photoLog.findMany(group ? { group } : undefined);
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
    const { title, description, date, photos, group } = await req.json();
    if (!title || !date) {
      return NextResponse.json({ error: "Title and date required" }, { status: 400 });
    }
    const item = await prisma.photoLog.create({
      data: {
        title,
        description: description || "",
        date,
        photos: photos || [],
        group: group || "general",
      },
    });
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
