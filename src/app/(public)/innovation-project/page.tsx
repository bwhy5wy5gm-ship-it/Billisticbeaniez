import type { Metadata } from "next";
import InnovationProjectPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Innovation Project",
  description: "Our FLL innovation project explores using seaweed and phytoplankton to remove CO₂ from ocean water, addressing climate change.",
};

export default function InnovationProjectPage() {
  return <InnovationProjectPageClient />;
}
