"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Calendar, X, Bot, Microscope, Users, Heart, Trophy } from "lucide-react";
import { useContent } from "@/lib/use-content";

interface PhotoItem {
  id: number;
  title: string;
  description: string;
  date: string;
  group: string;
  photos: string[];
  createdAt: string;
}

const categories = [
  { value: "robot", label: "Robot", icon: Bot, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/20" },
  { value: "innovation", label: "Innovation", icon: Microscope, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
  { value: "team", label: "Team", icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
  { value: "corevalues", label: "Core Values", icon: Heart, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20" },
  { value: "competition", label: "Competition", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
];

export default function PhotoLogPage() {
  const { getContent } = useContent();
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState<number>(2026);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const years = Array.from(new Set(items.map((i) => new Date(i.date).getFullYear()))).sort((a, b) => b - a);
  if (years.length === 0 && !loading) {
    years.push(2026);
  }

  const yearItems = items.filter((i) => new Date(i.date).getFullYear() === activeYear);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 px-5 py-2 text-sm border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
            >
              <Camera className="h-4 w-4" />
              Photo Log
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {getContent("photos.hero.title", "Photo Log")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
              {getContent("photos.hero.desc", "A visual timeline of our experiment and team activities.")}
            </p>
          </div>

          {/* Year Tabs */}
          <div className="flex justify-center gap-3 mb-12">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`px-8 py-3 rounded-xl text-lg font-bold transition-all duration-200 border-2 cursor-pointer ${
                  activeYear === year
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25"
                    : "bg-background text-muted-foreground border-border hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600"
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="space-y-12">
              {[1, 2].map((i) => (
                <div key={i}>
                  <div className="h-8 bg-muted rounded w-32 mb-4 animate-pulse" />
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((j) => (
                      <Card key={j} className="border-2 animate-pulse overflow-hidden">
                        <div className="aspect-[4/3] bg-muted" />
                        <CardContent className="p-5">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                          <div className="h-3 bg-muted rounded w-2/3" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-5">
                <div className="text-center py-20">
                  <Camera className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium text-lg mb-1">No photos yet</p>
                  <p className="text-sm text-muted-foreground/60">Photos will appear here once added in the admin panel.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-14">
              {categories.map((cat) => {
                const catItems = yearItems.filter((i) => i.group === cat.value);
                if (catItems.length === 0) return null;
                const CatIcon = cat.icon;
                return (
                  <div key={cat.value}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2.5 rounded-xl ${cat.bg}`}>
                        <CatIcon className={`h-5 w-5 ${cat.color}`} />
                      </div>
                      <h2 className="text-2xl font-bold">{cat.label}</h2>
                      <Badge variant="secondary" className="text-xs">{catItems.length}</Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {catItems.map((item) => (
                        <div key={item.id} className="flex flex-col gap-3">
                          {item.photos.length > 0 && (
                            <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300">
                              <img
                                src={item.photos[0]}
                                alt={item.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                onClick={() => setLightbox({ src: item.photos[0], alt: item.title })}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              {item.photos.length > 1 && (
                                <Badge className="absolute top-3 right-3 text-xs bg-black/60 text-white border-0 backdrop-blur-sm">
                                  +{item.photos.length - 1} more
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="px-1">
                            <Badge variant="outline" className="text-xs font-mono mb-1.5 gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </Badge>
                            <h3 className="font-semibold">{item.title}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {yearItems.length === 0 && (
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-5">
                    <div className="text-center py-16">
                      <Camera className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="font-medium text-muted-foreground">No photos for {activeYear}</p>
                      <p className="text-sm text-muted-foreground/60 mt-1">Try selecting a different year.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
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
