import type { Metadata } from "next";
import RobotPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Our Robot",
  description: "Meet our LEGO robot designed and built by Billistic Beaniez for FLL competition. See our engineering process and robot capabilities.",
};

export default function RobotPage() {
  return <RobotPageClient />;
}
