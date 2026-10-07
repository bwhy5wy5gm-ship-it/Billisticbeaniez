import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const data = await prisma.chartData.findMany();
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

interface ChartRowInput {
  label?: unknown;
  day?: unknown;
  co2Control?: unknown;
  co2Exp?: unknown;
  o2Control?: unknown;
  o2Exp?: unknown;
  tempControl?: unknown;
  tempExp?: unknown;
  humidityControl?: unknown;
  humidityExp?: unknown;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const currentUser = session?.user as { isAdmin?: boolean } | null | undefined;
    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { rows } = await req.json();
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: "rows must be an array" }, { status: 400 });
    }
    const cleaned = (rows as ChartRowInput[]).map((row, i) => ({
      label: String(row?.label || `Day ${i + 1}`),
      day: num(row?.day) || i + 1,
      co2Control: num(row?.co2Control),
      co2Exp: num(row?.co2Exp),
      o2Control: num(row?.o2Control),
      o2Exp: num(row?.o2Exp),
      tempControl: num(row?.tempControl),
      tempExp: num(row?.tempExp),
      humidityControl: num(row?.humidityControl),
      humidityExp: num(row?.humidityExp),
    }));
    await prisma.chartData.deleteAll();
    for (const row of cleaned) {
      await prisma.chartData.create({ data: row });
    }
    return NextResponse.json({ success: true, count: cleaned.length });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
