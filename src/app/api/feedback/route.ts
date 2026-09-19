import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const items = await prisma.feedback.findMany();
    const parsed = items.map((f: any) => ({
      ...f,
      photos: JSON.parse(f.photos || "[]"),
      company: f.company || "",
      person: f.person || "",
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
    const { title, description, date, company, person, photos } = await req.json();
    if (!title || !description || !date) {
      return NextResponse.json({ error: "Title, description, and date required" }, { status: 400 });
    }
    const item = await prisma.feedback.create({
      data: { title, description, date, company: company || "", person: person || "", photos: photos || [] },
    });
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
