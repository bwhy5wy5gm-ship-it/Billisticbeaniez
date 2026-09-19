"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquareText,
  Calendar,
  ArrowUpRight,
  Building,
  User,
  Star,
  ImageIcon,
} from "lucide-react";
import { useContent } from "@/lib/use-content";

interface FeedbackItem {
  id: number;
  title: string;
  description: string;
  date: string;
  company: string;
  person: string;
  rating?: number;
  photos: string[];
  createdAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { getContent } = useContent();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-20">
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 px-5 py-2 border border-pink-200/60 dark:border-pink-800/60 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300"
          >
            <MessageSquareText className="h-4 w-4" />
            Feedback
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">
            {getContent("feedback.hero.title", "Feedback We Have Received")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            {getContent(
              "feedback.hero.desc",
              "What people are saying about our project."
            )}
          </p>
        </div>

        {/* Loading skeletons */}
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-2 animate-pulse">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </div>
                  <div className="h-6 bg-muted rounded w-2/3 mb-4" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-4/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <Card className="border-2 border-dashed">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
                  <MessageSquareText className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground font-medium text-lg mb-2">
                  {getContent("feedback.empty.title", "No feedback yet")}
                </p>
                <p className="text-muted-foreground/60">
                  {getContent(
                    "feedback.empty.desc",
                    "Check back soon for feedback from the community."
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Feedback cards */
          <div className="grid gap-8 md:grid-cols-2">
            {items.map((item) => (
              <Link key={item.id} href={`/feedback/${item.id}`}>
                <Card className="border-2 h-full hover:border-pink-200/80 dark:hover:border-pink-800/50 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-pink-100/50 dark:hover:shadow-pink-900/20 hover:-translate-y-1">
                  <CardContent className="p-7 sm:p-8">
                    {/* Rating + date row */}
                    <div className="flex items-center justify-between gap-4 mb-5">
                      {item.rating != null && item.rating > 0 ? (
                        <StarRating rating={item.rating} />
                      ) : (
                        <div />
                      )}
                      <Badge
                        variant="outline"
                        className="text-xs font-mono shrink-0"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-xl mb-3 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {item.description.slice(0, 200)}
                      {item.description.length > 200 ? "..." : ""}
                    </p>

                    {/* Photo thumbnail */}
                    {item.photos && item.photos.length > 0 && (
                      <div className="mb-6">
                        <div className="h-24 w-full sm:h-32 rounded-xl bg-muted overflow-hidden border">
                          <img
                            src={item.photos[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {item.photos.length > 1 && (
                          <p className="text-xs text-muted-foreground/60 mt-2">
                            +{item.photos.length - 1} more photo
                            {item.photos.length - 1 !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Footer meta */}
                    <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-border/50">
                      {item.person && (
                        <Badge
                          variant="secondary"
                          className="gap-1.5 px-3 py-1"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/40">
                            <User className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                          </div>
                          {item.person}
                        </Badge>
                      )}
                      {item.company && (
                        <Badge
                          variant="secondary"
                          className="gap-1.5 px-3 py-1"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/40">
                            <Building className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                          </div>
                          {item.company}
                        </Badge>
                      )}
                    </div>

                    {/* Read more arrow */}
                    <div className="mt-5 flex items-center gap-1.5 text-sm text-muted-foreground/50 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors font-medium">
                      Read feedback
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
