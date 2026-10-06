import type { Metadata } from "next";
import { PlannerDownloads } from "@/components/planner/planner-downloads";

export const metadata: Metadata = {
  title: "Planner Downloads",
  description:
    "Download Billistic Beaniez planner runs as JSON, CSV, or SVG, and upload a file to see its contents.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlannerDownloadsPage() {
  return <PlannerDownloads />;
}
