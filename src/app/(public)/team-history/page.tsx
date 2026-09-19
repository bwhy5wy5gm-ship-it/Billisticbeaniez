import type { Metadata } from "next";
import TeamHistoryPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Team History",
  description: "The story of Billistic Beaniez FLL team — our journey through seasons of robotics, learning, and growth.",
};

export default function TeamHistoryPage() {
  return <TeamHistoryPageClient />;
}
