import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateSensorData(tank: string) {
  const base = tank === "experiment" ? { co2: 380, oxygen: 21.5, humidity: 65, temperature: 22 } : { co2: 420, oxygen: 20.8, humidity: 63, temperature: 21.5 };
  return {
    tank,
    co2: +(base.co2 + (Math.random() - 0.5) * 20).toFixed(2),
    oxygen: +(base.oxygen + (Math.random() - 0.5) * 1.5).toFixed(2),
    humidity: +(base.humidity + (Math.random() - 0.5) * 5).toFixed(2),
    temperature: +(base.temperature + (Math.random() - 0.5) * 2).toFixed(2),
  };
}

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { key: "demo" } });
    const isDemo = settings?.value === "true" || !settings;

    if (isDemo) {
      const control = generateSensorData("control");
      const experiment = generateSensorData("experiment");
      return NextResponse.json({ mode: "demo", control, experiment });
    }

    const latestControl = await prisma.sensorData.findFirst({
      where: { tank: "control" },
      orderBy: { timestamp: "desc" },
    });
    const latestExperiment = await prisma.sensorData.findFirst({
      where: { tank: "experiment" },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({
      mode: "live",
      control: latestControl || generateSensorData("control"),
      experiment: latestExperiment || generateSensorData("experiment"),
    });
  } catch {
    const control = generateSensorData("control");
    const experiment = generateSensorData("experiment");
    return NextResponse.json({ mode: "demo", control, experiment });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const record = await prisma.sensorData.create({
      data: {
        tank: data.tank,
        co2: data.co2,
        oxygen: data.oxygen,
        humidity: data.humidity,
        temperature: data.temperature,
      },
    });
    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
