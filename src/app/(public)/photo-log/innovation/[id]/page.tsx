"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Lightbulb } from "lucide-react";

interface PhotoItem {
  id: number;
  title: string;
  description: string;
  date: string;
  photos: string[];
  createdAt: string;
}

export default function InnovationPhotoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [item, setItem] = useState<PhotoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/photos/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setItem(data.id ? data : null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground mb-4">Photo entry not found.</p>
          <Link href="/photo-log/innovation">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Innovation Photos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/photo-log/innovation"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Innovation Photos
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="gap-1.5 text-xs font-mono">
            <Calendar className="h-3 w-3" />
            {new Date(item.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold mb-6">{item.title}</h1>

        {item.photos.length > 0 && (
          <div className="space-y-4 mb-8">
            {item.photos.map((photo, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border-2 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setLightbox(photo)}
              >
                <img
                  src={photo}
                  alt={`${item.title} photo ${i + 1}`}
                  className="w-full max-h-[500px] object-contain bg-muted"
                />
              </div>
            ))}
          </div>
        )}

        {item.description && (
          <Card className="border-2">
            <CardContent className="pt-5">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Full size"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}
