import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function cuid(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "c";
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

async function getDocs(): Promise<any[]> {
  const row = await prisma.siteContent.findUnique({ where: { key: "site.documents" } });
  if (!row || !row.value) return [];
  try {
    const parsed = JSON.parse(row.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveDocs(docs: any[]) {
  await prisma.siteContent.upsert({
    where: { key: "site.documents" },
    update: { value: JSON.stringify(docs) },
    create: { key: "site.documents", value: JSON.stringify(docs) },
  });
}

export async function GET() {
  try {
    const docs = await getDocs();
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, category, fileUrl, fileName, fileSize, fileType } = await req.json();
    if (!title || !fileUrl || !fileName) {
      return NextResponse.json({ error: "Title, fileUrl, and fileName required" }, { status: 400 });
    }

    const docs = await getDocs();
    const doc = {
      id: cuid(),
      title,
      description: description || "",
      category: category || "general",
      fileUrl,
      fileName,
      fileSize: fileSize || 0,
      fileType: fileType || "",
      createdAt: new Date().toISOString(),
    };
    docs.unshift(doc);
    await saveDocs(docs);

    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const docs = await getDocs();
    const filtered = docs.filter((d: any) => d.id !== id);
    await saveDocs(filtered);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
