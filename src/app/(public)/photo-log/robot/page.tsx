"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Calendar } from "lucide-react";

interface PhotoItem {
  id: number;
  title: string;
  description: string;
  date: string;
  photos: string[];
  createdAt: string;
}

export default function RobotPhotosPage() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/photos?group=robot")
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
            className="mb-4 gap-1.5 px-4 py-1.5 border border-cyan-200/60 dark:border-cyan-800/60 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
          >
            <Bot className="h-3.5 w-3.5" />
            Robot
          </Badge>
          <h1 className="text-4xl font-bold mb-3">Robot Photos</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Design, build, and programming sessions for our robot.
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
                <Bot className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium mb-1">
                  No robot photos yet
                </p>
                <p className="text-sm text-muted-foreground/60">
                  Robot design and build photos will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Link key={item.id} href={`/photo-log/robot/${item.id}`}>
                <Card className="border-2 hover:border-cyan-200/80 dark:hover:border-cyan-800/50 transition-all hover:shadow-sm cursor-pointer group overflow-hidden h-full">
                  {item.photos.length > 0 ? (
                    <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                      <img
                        src={item.photos[0]}
                        alt={item.title}
                        className="h-full w-full object-contain bg-muted group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.photos.length > 1 && (
                        <Badge className="absolute top-2 right-2 text-xs bg-black/50 text-white border-0">
                          +{item.photos.length - 1} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      <Bot className="h-8 w-8 text-muted-foreground/30" />
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
                    <h3 className="font-semibold group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
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
