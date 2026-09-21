import type { Metadata } from "next";
import RobotPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Our Robot | Billistic Beaniez FIRST LEGO League",
  description: "Meet our FIRST LEGO League robot designed and built by Billistic Beaniez. See our robot design, programming, sensors, attachments, and FLL competition engineering process.",
};

export default function RobotPage() {
  return <RobotPageClient />;
}
