import type { Metadata } from "next";
import DashboardPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Live Dashboard",
  description: "Real-time sensor data and experiment monitoring for our FLL ocean CO₂ removal project.",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
