import type { Metadata } from "next";
import InnovationProjectPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Innovation Project | Billistic Beaniez FIRST LEGO League",
  description: "Our FLL Innovation Project. Billistic Beaniez researches real world problems and develops creative solutions as part of FIRST LEGO League competition.",
};

export default function InnovationProjectPage() {
  return <InnovationProjectPageClient />;
}
