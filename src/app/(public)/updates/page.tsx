import type { Metadata } from "next";
import UpdatesPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Project Updates | Billistic Beaniez FIRST LEGO League",
  description: "Follow the Billistic Beaniez FLL team's progress with updates on our robot build, Innovation Project, and competition preparation.",
};

export default function UpdatesPage() {
  return <UpdatesPageClient />;
}
