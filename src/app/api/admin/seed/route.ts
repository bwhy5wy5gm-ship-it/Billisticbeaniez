import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: "admin@billisticbeaniez.com" },
    });
    if (existing) {
      return NextResponse.json({ message: "Admin already exists" });
    }
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@billisticbeaniez.com",
        hashedPassword,
        isAdmin: true,
        role: "admin",
      },
    });
    await prisma.siteSettings.upsert({
      where: { key: "demo" },
      update: { value: "true" },
      create: { key: "demo", value: "true" },
    });
    await prisma.siteContent.upsert({
      where: { key: "homepage_title" },
      update: { value: "FLL Ocean CO₂ Innovation Project" },
      create: { key: "homepage_title", value: "FLL Ocean CO₂ Innovation Project" },
    });
    await prisma.siteContent.upsert({
      where: { key: "homepage_description" },
      update: { value: "Using biology to remove CO₂ from ocean water." },
      create: { key: "homepage_description", value: "Using biology to remove CO₂ from ocean water." },
    });
    return NextResponse.json({ success: true, email: "admin@billisticbeaniez.com", password: "admin123" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
