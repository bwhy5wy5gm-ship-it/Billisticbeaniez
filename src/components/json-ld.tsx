"use client";

import { useEffect } from "react";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Billistic Beaniez",
  url: "https://billisticbeaniez.com",
  description:
    "Billistic Beaniez (Team 3818) is a FIRST LEGO League robotics team from Perth, Western Australia. 2025 Innovation Award winners at Forrestfield Regional and 2nd Place Innovation Award at Nationals West.",
  logo: "https://billisticbeaniez.com/og-image.svg",
  sameAs: [],
  foundingDate: "2025",
  location: {
    "@type": "Place",
    name: "Perth, Western Australia",
  },
  keywords: "FIRST LEGO League, FLL, robotics team, STEM, engineering, LEGO robot, innovation project, Perth, Western Australia, team 3818",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Billistic Beaniez",
  url: "https://billisticbeaniez.com",
  description:
    "Billistic Beaniez (Team 3818) is a FIRST LEGO League robotics team from Perth, WA. Explore our robot, Innovation Project, and FLL journey.",
  publisher: {
    "@type": "Organization",
    name: "Billistic Beaniez",
  },
};

export function JsonLd() {
  useEffect(() => {
    const s1 = document.createElement("script");
    s1.type = "application/ld+json";
    s1.id = "organization-jsonld";
    s1.textContent = JSON.stringify(organizationJsonLd);
    document.head.appendChild(s1);

    const s2 = document.createElement("script");
    s2.type = "application/ld+json";
    s2.id = "website-jsonld";
    s2.textContent = JSON.stringify(websiteJsonLd);
    document.head.appendChild(s2);

    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  return null;
}
