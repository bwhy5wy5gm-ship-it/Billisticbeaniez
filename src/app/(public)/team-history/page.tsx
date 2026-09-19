"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trophy, Star, Camera } from "lucide-react";

interface HistoryEntry {
  id: string;
  year: number;
  title: string;
  description: string;
  photos: string[];
}

export default function TeamHistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.map((h: any) => ({ ...h, photos: h.photos || [] })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sorted = [...entries].sort((a, b) => b.year - a.year);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 gap-1.5 px-4 py-1.5 border border-cyan-200/60 dark:border-cyan-800/60 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
          >
            <Trophy className="h-3.5 w-3.5" />
            Team History
          </Badge>
          <h1 className="text-4xl font-bold mb-3">Our Journey</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            A timeline of our team's growth, achievements, and milestones over the years.
          </p>
        </div>

        {loading ? (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative flex gap-6 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-muted border-4 border-background z-10 shrink-0" />
                  <Card className="flex-1 border-2">
                    <CardContent className="pt-5">
                      <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                      <div className="h-6 bg-muted rounded w-2/3 mb-2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ) : sorted.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-5">
              <div className="text-center py-12">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium mb-1">
                  No history entries yet
                </p>
                <p className="text-sm text-muted-foreground/60">
                  Our story is just getting started. Check back soon.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-emerald-400 to-cyan-400 dark:from-cyan-600 dark:via-emerald-600 dark:to-cyan-600" />
            <div className="space-y-8">
              {sorted.map((entry, i) => (
                <div key={entry.id} className="relative flex gap-6">
                  <div className="relative z-10 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm border-4 border-background shadow-lg">
                      {String(entry.year).slice(-2)}
                    </div>
                  </div>
                  <Card className="flex-1 border-2 hover:border-cyan-200/80 dark:hover:border-cyan-800/50 transition-all hover:shadow-md">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs font-mono gap-1">
                          <Calendar className="h-3 w-3" />
                          {entry.year}
                        </Badge>
                        {entry.photos && entry.photos.length > 0 && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Camera className="h-3 w-3" />
                            {entry.photos.length} photo{entry.photos.length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-cyan-700 dark:text-cyan-300">
                        <Star className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                        {entry.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {entry.description}
                      </p>
                      {entry.photos && entry.photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                          {entry.photos.map((url, j) => (
                            <div key={j} className="aspect-square rounded-lg overflow-hidden border bg-muted">
                              <img
                                src={url}
                                alt=""
                                className="h-full w-full object-contain bg-muted"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
