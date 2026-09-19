"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Camera, X } from "lucide-react";

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
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-24">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 px-5 py-2 text-sm border border-cyan-200/60 dark:border-cyan-800/60 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
            >
              <Trophy className="h-4 w-4" />
              Team History
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">Our Journey</h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
              A timeline of our team&apos;s growth, achievements, and milestones over the years.
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-muted rounded-full" />
              <div className="space-y-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative flex gap-8 animate-pulse">
                    <div className="w-16 h-16 rounded-2xl bg-muted border-4 border-background z-10 shrink-0" />
                    <Card className="flex-1 border-2">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                        <div className="h-7 bg-muted rounded w-2/3 mb-3" />
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
                <div className="text-center py-20">
                  <Trophy className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium text-lg mb-1">No history entries yet</p>
                  <p className="text-sm text-muted-foreground/60">Our story is just getting started. Check back soon.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-emerald-400 to-cyan-400 dark:from-cyan-600 dark:via-emerald-600 dark:to-cyan-600 rounded-full" />

              <div className="space-y-16">
                {sorted.map((entry, i) => (
                  <div key={entry.id} className="relative flex gap-8 items-start group">
                    {/* Year badge */}
                    <div className="relative z-10 shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg border-4 border-background shadow-xl shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow duration-300">
                        {String(entry.year).slice(-2)}
                      </div>
                    </div>

                    {/* Card */}
                    <Card className="flex-1 border-2 hover:border-cyan-200/80 dark:hover:border-cyan-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1">
                      <CardContent className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant="outline" className="text-sm font-mono gap-1.5 px-3 py-1">
                            {entry.year}
                          </Badge>
                          {entry.photos && entry.photos.length > 0 && (
                            <Badge variant="secondary" className="text-sm gap-1.5 px-3 py-1">
                              <Camera className="h-3.5 w-3.5" />
                              {entry.photos.length} photo{entry.photos.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-2xl mb-3 flex items-center gap-2">
                          <Star className="h-5 w-5 text-cyan-500 shrink-0" />
                          {entry.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-base mb-4">
                          {entry.description}
                        </p>

                        {/* Photo grid */}
                        {entry.photos && entry.photos.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                            {entry.photos.map((url, j) => (
                              <div
                                key={j}
                                className="group/photo relative aspect-square rounded-xl overflow-hidden border-2 bg-muted cursor-pointer hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors duration-200"
                                onClick={() => setLightbox({ src: url, alt: `${entry.title} - photo ${j + 1}` })}
                              >
                                <img
                                  src={url}
                                  alt=""
                                  className="h-full w-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/10 transition-colors duration-300" />
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

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
