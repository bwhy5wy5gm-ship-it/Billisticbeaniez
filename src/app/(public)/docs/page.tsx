import type { Metadata } from "next";
import DocsPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Documents | Billistic Beaniez FIRST LEGO League",
  description: "Download documents, resources, and materials from the Billistic Beaniez FIRST LEGO League team (Team #3818) in Perth, WA.",
};

export default function DocsPage() {
  return <DocsPageClient />;
}
