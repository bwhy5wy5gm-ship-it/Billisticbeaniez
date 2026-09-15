"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Calendar, ArrowUpRight } from "lucide-react";

interface PhotoItem {
  id: number;
  title: string;
  description: string;
  date: string;
  photos: string[];
  createdAt: string;
}

export default function PhotoLogPage() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 gap-1.5 px-4 py-1.5 border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
          >
            <Camera className="h-3.5 w-3.5" />
            Photo Log
          </Badge>
          <h1 className="text-4xl font-bold mb-3">Photo Log</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            A visual timeline of our experiment and team activities.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-2 animate-pulse overflow-hidden">
                <div className="aspect-[4/3] bg-muted" />
                <CardContent className="pt-4">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-5">
              <div className="text-center py-12">
                <Camera className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium mb-1">
                  No photos yet
                </p>
                <p className="text-sm text-muted-foreground/60">
                  Photos from the experiment will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Link key={item.id} href={`/photo-log/${item.id}`}>
                <Card className="border-2 hover:border-indigo-200/80 dark:hover:border-indigo-800/50 transition-all hover:shadow-sm cursor-pointer group overflow-hidden h-full">
                  {item.photos.length > 0 ? (
                    <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                      <img
                        src={item.photos[0]}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.photos.length > 1 && (
                        <Badge className="absolute top-2 right-2 text-xs bg-black/50 text-white border-0">
                          +{item.photos.length - 1} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      <Camera className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <CardContent className="pt-4">
                    <Badge variant="outline" className="text-xs font-mono mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Badge>
                    <h3 className="font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
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
