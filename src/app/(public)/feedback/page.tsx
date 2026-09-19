import type { Metadata } from "next";
import FeedbackPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Innovation Feedback",
  description: "Share your feedback and insights on our FLL innovation project. We value expert and community input.",
};

export default function FeedbackPage() {
  return <FeedbackPageClient />;
}
