import type { Metadata } from "next";
import FeedbackPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Innovation Feedback | Billistic Beaniez FIRST LEGO League",
  description: "Feedback and insights from the community on the Billistic Beaniez FLL Innovation Project. We value expert and community input.",
};

export default function FeedbackPage() {
  return <FeedbackPageClient />;
}
