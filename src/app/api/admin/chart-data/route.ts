import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const data = prisma.chartData.findMany();
    return NextResponse.json({ data });
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
    const { rows } = await req.json();
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: "rows must be an array" }, { status: 400 });
    }
    prisma.chartData.deleteAll();
    for (const row of rows) {
      prisma.chartData.create({
        data: {
          label: row.label,
          day: row.day,
          co2Control: row.co2Control ?? 0,
          co2Exp: row.co2Exp ?? 0,
          o2Control: row.o2Control ?? 0,
          o2Exp: row.o2Exp ?? 0,
          tempControl: row.tempControl ?? 0,
          tempExp: row.tempExp ?? 0,
          humidityControl: row.humidityControl ?? 0,
          humidityExp: row.humidityExp ?? 0,
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
