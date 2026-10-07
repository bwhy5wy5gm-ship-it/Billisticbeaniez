import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  const contents = await prisma.siteContent.findMany();
  const obj: Record<string, string> = {};
  contents.forEach((c) => {
    if (!c.key.startsWith("planner.store")) obj[c.key] = c.value;
  });
  const res = NextResponse.json(obj);
  res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res;
}
