"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";

interface Update {
  id: number;
  title: string;
  description: string;
  date: string;
  photos: string[];
  createdAt: string;
}

export default function UpdateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [update, setUpdate] = useState<Update | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/updates/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setUpdate(data.id ? { ...data, photos: data.photos || [] } : null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4" />
          <div className="h-8 bg-muted rounded w-2/3 mb-6" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!update) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground mb-4">Update not found.</p>
          <Link href="/updates">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Updates
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
          href="/updates"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Updates
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="gap-1.5 text-xs font-mono">
            <Calendar className="h-3 w-3" />
            {new Date(update.date || update.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold mb-6">{update.title}</h1>

        {update.photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {update.photos.map((photo, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border-2 cursor-pointer hover:opacity-90 transition-opacity aspect-square"
                onClick={() => setLightbox(photo)}
              >
                <img
                  src={photo}
                  alt={`${update.title} photo ${i + 1}`}
                  className="h-full w-full object-contain bg-muted"
                />
              </div>
            ))}
          </div>
        )}

        <Card className="border-2">
          <CardContent className="pt-5">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {update.description.split("\n").map((para, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
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
