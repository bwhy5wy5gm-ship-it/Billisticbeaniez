import type { Metadata } from "next";
import ContactPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Contact Us | Billistic Beaniez FIRST LEGO League",
  description: "Get in touch with the Billistic Beaniez FIRST LEGO League team (Team #3818) from Perth, WA. We welcome questions about our robotics, engineering, and Innovation Project.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
