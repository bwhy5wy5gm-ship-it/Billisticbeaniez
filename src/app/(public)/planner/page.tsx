import type { Metadata } from "next";
import { PlannerApp } from "@/components/planner/planner-app";

export const metadata: Metadata = {
  title: "BioGlow Robot Game Planner",
  description:
    "Interactive 2026 to 27 BioGlow FLL robot game planner with a mat canvas, missions, scoring, and a 2 minute 30 second timer.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlannerPage() {
  return <PlannerApp />;
}
