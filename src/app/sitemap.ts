import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://billisticbeaniez.com";

  const publicPages = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/robot", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/innovation-project", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/core-values", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/team-history", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/team", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/updates", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/feedback", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/photo-log", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/dashboard", priority: 0.5, changeFrequency: "weekly" as const },
  ];

  return publicPages.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
