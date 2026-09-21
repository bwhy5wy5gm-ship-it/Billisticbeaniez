import type { Metadata } from "next";
import TeamHistoryPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Our FLL Journey | Billistic Beaniez FIRST LEGO League",
  description: "The story of Billistic Beaniez — our FIRST LEGO League journey through robotics competitions, Innovation Projects, and team growth.",
};

export default function TeamHistoryPage() {
  return <TeamHistoryPageClient />;
}
