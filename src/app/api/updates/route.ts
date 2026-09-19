import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const updates = await prisma.projectUpdate.findMany();
    const parsed = updates.map((u: any) => ({
      ...u,
      photos: JSON.parse(u.photos || "[]"),
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
    if (!title || !description || !date) {
      return NextResponse.json({ error: "Title, description, and date required" }, { status: 400 });
    }
    const update = await prisma.projectUpdate.create({
      data: { title, description, date, photos: photos || [] },
    });
    return NextResponse.json(update);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
