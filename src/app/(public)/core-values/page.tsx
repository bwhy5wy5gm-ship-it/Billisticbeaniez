import type { Metadata } from "next";
import CoreValuesPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Core Values | Billistic Beaniez FIRST LEGO League",
  description: "The FIRST LEGO League Core Values that guide Billistic Beaniez, teamwork, discovery, impact, inclusion, innovation, and fun.",
};

export default function CoreValuesPage() {
  return <CoreValuesPageClient />;
}
