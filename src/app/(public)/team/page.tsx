import type { Metadata } from "next";
import TeamPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Meet the Team | Billistic Beaniez FIRST LEGO League",
  description: "Meet the Billistic Beaniez FIRST LEGO League robotics team — six passionate students working together on robot design, programming, research, and innovation.",
};

export default function TeamPage() {
  return <TeamPageClient />;
}
