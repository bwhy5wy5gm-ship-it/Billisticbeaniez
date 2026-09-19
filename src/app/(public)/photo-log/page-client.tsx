"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Calendar, X } from "lucide-react";
import { useContent } from "@/lib/use-content";

interface PhotoItem {
  id: number;
  title: string;
  description: string;
  date: string;
  photos: string[];
  createdAt: string;
}

export default function PhotoLogPage() {
  const { getContent } = useContent();
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
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

  const allPhotos = items.flatMap((item) =>
    item.photos.map((src) => ({
      src,
      title: item.title,
      date: item.date,
      id: item.id,
    }))
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-20">
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

          {/* Category Filter Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {["all", ...new Set(items.map((i) => i.title))].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border-2 cursor-pointer ${
                  filter === cat
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25"
                    : "bg-background text-muted-foreground border-border hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600"
                }`}
              >
                {cat === "all" ? "All Photos" : cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-2 animate-pulse overflow-hidden">
                  <div className="aspect-[4/3] bg-muted" />
                  <CardContent className="p-5">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-5">
                <div className="text-center py-20">
                  <Camera className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium text-lg mb-1">No photos yet</p>
                  <p className="text-sm text-muted-foreground/60">Photos from the experiment will appear here.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items
                .filter((item) => filter === "all" || item.title === filter)
                .map((item) => (
                  <div key={item.id} className="flex flex-col gap-4">
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
                        <button
                          onClick={() => setLightbox({ src: item.photos[0], alt: item.title })}
                          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/30"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div className="px-1">
                      <Badge variant="outline" className="text-xs font-mono mb-2 gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Badge>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
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
