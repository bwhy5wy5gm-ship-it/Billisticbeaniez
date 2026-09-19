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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 gap-1.5 px-4 py-1.5 border border-amber-200/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
          >
            <Calendar className="h-3.5 w-3.5" />
            Updates
          </Badge>
          <h1 className="text-4xl font-bold mb-3">{getContent("updates.hero.title", "Project Updates")}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {getContent("updates.hero.desc", "Follow our experiment progress over time.")}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2 animate-pulse">
                <CardContent className="pt-5">
                  <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                  <div className="h-6 bg-muted rounded w-2/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : updates.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-5">
              <div className="text-center py-12">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium mb-1">
                  {getContent("updates.empty.title", "No updates yet")}
                </p>
                <p className="text-sm text-muted-foreground/60">
                  {getContent("updates.empty.desc", "Check back soon for experiment progress.")}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <Link key={update.id} href={`/updates/${update.id}`}>
                <Card className="border-2 hover:border-amber-200/80 dark:hover:border-amber-800/50 transition-all hover:shadow-sm cursor-pointer group">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
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
                            <Badge variant="secondary" className="text-xs gap-1">
                              {update.photos.length} photo{update.photos.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {update.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {update.description.slice(0, 160)}
                          {update.description.length > 160 ? "..." : ""}
                        </p>
                      </div>
                      {update.photos && update.photos.length > 0 && (
                        <div className="shrink-0">
                          <div className="h-16 w-16 rounded-xl bg-muted overflow-hidden border">
                            <img
                              src={update.photos[0]}
                              alt=""
                              className="h-full w-full object-contain bg-muted"
                            />
                          </div>
                        </div>
                      )}
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-amber-500 transition-colors shrink-0 mt-1" />
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
