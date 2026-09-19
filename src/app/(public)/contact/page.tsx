import type { Metadata } from "next";
import ContactPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Billistic Beaniez FLL team. We welcome questions about our ocean CO₂ research and robotics project.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
