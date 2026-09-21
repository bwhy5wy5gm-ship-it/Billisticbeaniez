import type { Metadata } from "next";
import PhotoLogPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Photo Log | Billistic Beaniez FIRST LEGO League",
  description: "A visual timeline of Billistic Beaniez through build sessions, experiments, team activities, and FLL competitions.",
};

export default function PhotoLogPage() {
  return <PhotoLogPageClient />;
}
