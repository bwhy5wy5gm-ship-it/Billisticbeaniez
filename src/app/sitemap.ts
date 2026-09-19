import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://billisticbeaniez.com";

  const publicPages = [
    "",
    "/robot",
    "/innovation-project",
    "/core-values",
    "/updates",
    "/feedback",
    "/photo-log",
    "/photo-log/robot",
    "/photo-log/innovation",
    "/photo-log/team",
    "/photo-log/core-values",
    "/photo-log/competition",
    "/team-history",
    "/contact",
    "/dashboard",
  ];

  return publicPages.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
}
