"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquareText, Calendar, ArrowUpRight, Building, User } from "lucide-react";
import { useContent } from "@/lib/use-content";

interface FeedbackItem {
  id: number;
  title: string;
  description: string;
  date: string;
  company: string;
  person: string;
  photos: string[];
  createdAt: string;
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 gap-1.5 px-4 py-1.5 border border-pink-200/60 dark:border-pink-800/60 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300"
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            Feedback
          </Badge>
          <h1 className="text-4xl font-bold mb-3">{getContent("feedback.hero.title", "Feedback We Have Received")}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {getContent("feedback.hero.desc", "What people are saying about our project.")}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2 animate-pulse">
                <CardContent className="pt-5">
                  <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                  <div className="h-6 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-5">
              <div className="text-center py-12">
                <MessageSquareText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium mb-1">
                  {getContent("feedback.empty.title", "No feedback yet")}
                </p>
                <p className="text-sm text-muted-foreground/60">
                  {getContent("feedback.empty.desc", "Check back soon for feedback from the community.")}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <Link key={item.id} href={`/feedback/${item.id}`}>
                <Card className="border-2 hover:border-pink-200/80 dark:hover:border-pink-800/50 transition-all hover:shadow-sm cursor-pointer group">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs font-mono">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Badge>
                          {item.person && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <User className="h-3 w-3" />
                              {item.person}
                            </Badge>
                          )}
                          {item.company && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Building className="h-3 w-3" />
                              {item.company}
                            </Badge>
                          )}
                          {item.photos && item.photos.length > 0 && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              {item.photos.length} photo{item.photos.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description.slice(0, 160)}
                          {item.description.length > 160 ? "..." : ""}
                        </p>
                      </div>
                      {item.photos && item.photos.length > 0 && (
                        <div className="shrink-0">
                          <div className="h-16 w-16 rounded-xl bg-muted overflow-hidden border">
                            <img
                              src={item.photos[0]}
                              alt=""
                              className="h-full w-full object-contain bg-muted"
                            />
                          </div>
                        </div>
                      )}
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-pink-500 transition-colors shrink-0 mt-1" />
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
