"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowUpRight, FileText } from "lucide-react";
import { useContent } from "@/lib/use-content";

interface Update {
  id: number;
  title: string;
  description: string;
  date: string;
  photos: string[];
  createdAt: string;
}

export default function UpdatesPage() {
  const { getContent } = useContent();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/updates")
      .then((r) => r.json())
      .then((data) => {
        setUpdates(data.map((u: any) => ({ ...u, photos: u.photos || [] })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 px-5 py-2 border border-amber-200/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
          >
            <Calendar className="h-4 w-4" />
            Updates
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">
            {getContent("updates.hero.title", "Project Updates")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {getContent("updates.hero.desc", "Follow our experiment progress over time.")}
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2 animate-pulse">
                <CardContent className="pt-6 pb-8">
                  <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                  <div className="h-7 bg-muted rounded w-2/3 mb-3" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : updates.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6 pb-8">
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/60 mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground font-medium text-lg mb-1">
                  {getContent("updates.empty.title", "No updates yet")}
                </p>
                <p className="text-sm text-muted-foreground/60">
                  {getContent("updates.empty.desc", "Check back soon for experiment progress.")}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {updates.map((update) => (
              <Link key={update.id} href={`/updates/${update.id}`}>
                <Card className="border-2 hover:border-amber-200/80 dark:hover:border-amber-800/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="pt-6 pb-7">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-3">
                          <Badge variant="outline" className="text-xs font-mono">
                            {new Date(update.date || update.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </Badge>
                          {update.photos && update.photos.length > 0 && (
                            <Badge variant="secondary" className="text-xs gap-1.5">
                              {update.photos.length} photo{update.photos.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-xl mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {update.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                          {update.description.slice(0, 200)}
                          {update.description.length > 200 ? "..." : ""}
                        </p>

                        {update.photos && update.photos.length > 0 && (
                          <div className="flex gap-2.5 mt-4">
                            {update.photos.slice(0, 4).map((photo, idx) => (
                              <div
                                key={idx}
                                className="h-20 w-20 rounded-xl overflow-hidden border bg-muted shrink-0"
                              >
                                <img
                                  src={photo}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                            {update.photos.length > 4 && (
                              <div className="h-20 w-20 rounded-xl bg-muted/60 border flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
                                +{update.photos.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-amber-500 transition-colors shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
