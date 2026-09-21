"use client";

import { useEffect } from "react";
import { useContent } from "@/lib/use-content";

export function FaviconUpdater() {
  const { getContent } = useContent();
  const favicon = getContent("site.favicon", "");

  useEffect(() => {
    if (!favicon) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
    link.type = favicon.endsWith(".svg") ? "image/svg+xml" : "image/png";
  }, [favicon]);

  return null;
}
