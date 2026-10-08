import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type UpdateRow = {
  id: string;
  title: string;
  description: string;
  date: string;
  photos?: string;
  createdAt?: string;
};

export async function GET() {
  try {
    const updates = await prisma.projectUpdate.findMany();
    const parsed = (updates as UpdateRow[]).map((u) => ({
      ...u,
      photos: JSON.parse(u.photos || "[]") as string[],
    }));
    parsed.sort((a, b) => {
      const da = String(a.date || a.createdAt || "");
      const db = String(b.date || b.createdAt || "");
      if (da !== db) return da < db ? 1 : -1;
      const ca = String(a.createdAt || "");
      const cb = String(b.createdAt || "");
      if (ca !== cb) return ca < cb ? 1 : -1;
      return 0;
    });
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const currentUser = session?.user as { isAdmin?: boolean } | null | undefined;
    if (!currentUser?.isAdmin) {
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
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
