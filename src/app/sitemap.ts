import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://billisticbeaniez.com";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/robot`, lastModified: now },
    { url: `${base}/innovation-project`, lastModified: now },
    { url: `${base}/core-values`, lastModified: now },
    { url: `${base}/team-history`, lastModified: now },
    { url: `${base}/team`, lastModified: now },
    { url: `${base}/updates`, lastModified: now },
    { url: `${base}/feedback`, lastModified: now },
    { url: `${base}/photo-log`, lastModified: now },
    { url: `${base}/contact`, lastModified: now },
    { url: `${base}/photo-log/robot`, lastModified: now },
    { url: `${base}/photo-log/innovation`, lastModified: now },
    { url: `${base}/photo-log/team`, lastModified: now },
    { url: `${base}/photo-log/core-values`, lastModified: now },
    { url: `${base}/photo-log/competition`, lastModified: now },
  ];

  const dynamicPages: MetadataRoute.Sitemap = [];

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const sb = createClient(url, key);

      const { data: photos } = await sb
        .from("PhotoLog")
        .select("id, createdAt")
        .order("createdAt", { ascending: false });

      if (photos) {
        for (const photo of photos) {
          dynamicPages.push({
            url: `${base}/photo-log/${photo.id}`,
            lastModified: new Date(photo.createdAt),
          });
        }
      }

      const { data: updates } = await sb
        .from("Update")
        .select("id, createdAt")
        .order("createdAt", { ascending: false });

      if (updates) {
        for (const update of updates) {
          dynamicPages.push({
            url: `${base}/updates/${update.id}`,
            lastModified: new Date(update.createdAt),
          });
        }
      }
    }
  } catch {
    // Database unavailable, return static pages only
  }

  return [...staticPages, ...dynamicPages];
}
