import type { Metadata } from "next";
import PhotoLogPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Photo Log",
  description: "Visual journey of Billistic Beaniez through build sessions, experiments, and FLL competitions.",
};

export default function PhotoLogPage() {
  return <PhotoLogPageClient />;
}
