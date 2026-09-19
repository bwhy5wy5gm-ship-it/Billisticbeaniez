import type { Metadata } from "next";
import UpdatesPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Project Updates",
  description: "Follow Billistic Beaniez progress with the latest updates on our FLL robot build, innovation project, and competition preparation.",
};

export default function UpdatesPage() {
  return <UpdatesPageClient />;
}
