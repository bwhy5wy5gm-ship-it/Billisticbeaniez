import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isValidOwner, normalizeStore, PLANS_KEY } from "@/lib/planner/defaults";

const MAX_STORE_CHARS = 1500000;

function plansKey(owner: string) {
  return `${PLANS_KEY}.${owner}`;
}

function sessionUserId(session: Session | null): string | undefined {
  return (session?.user as { id?: string } | undefined)?.id;
}

function ownerMatchesUser(owner: string, userId: string): boolean {
  const rest = owner.slice(2);
  return rest === userId || rest.startsWith(`${userId}.`);
}

export async function GET(req: NextRequest) {
  try {
    const owner = req.nextUrl.searchParams.get("owner") || "";
    if (!isValidOwner(owner)) {
      return NextResponse.json({ error: "Invalid owner" }, { status: 400 });
    }
    if (owner.startsWith("u:")) {
      const userId = sessionUserId(await auth());
      if (!userId || !ownerMatchesUser(owner, userId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    const row = await prisma.siteContent.findUnique({ where: { key: plansKey(owner) } });
    if (!row || !row.value) {
      return NextResponse.json({ store: null });
    }
    const store = normalizeStore(JSON.parse(row.value));
    return NextResponse.json({ store });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const owner = typeof body?.owner === "string" ? body.owner : "";
    if (!isValidOwner(owner)) {
      return NextResponse.json({ error: "Invalid owner" }, { status: 400 });
    }
    if (owner.startsWith("u:")) {
      const userId = sessionUserId(await auth());
      if (!userId || !ownerMatchesUser(owner, userId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    const store = normalizeStore(body?.store);
    if (!store) {
      return NextResponse.json({ error: "Invalid plan data" }, { status: 400 });
    }
    const value = JSON.stringify(store);
    if (value.length > MAX_STORE_CHARS) {
      return NextResponse.json({ error: "Plan data too large" }, { status: 413 });
    }
    await prisma.siteContent.upsert({
      where: { key: plansKey(owner) },
      update: { value },
      create: { key: plansKey(owner), value },
    });
    return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
