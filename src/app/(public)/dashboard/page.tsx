import type { Metadata } from "next";
import DashboardPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Live Dashboard | Billistic Beaniez FIRST LEGO League",
  description: "Real-time sensor data and experiment monitoring from the Billistic Beaniez FLL Innovation Project.",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
