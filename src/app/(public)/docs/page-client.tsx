"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  ExternalLink,
  FolderOpen,
} from "lucide-react";

type Document = {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
};

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "robot", label: "Robot" },
  { value: "innovation", label: "Innovation Project" },
  { value: "core-values", label: "Core Values" },
  { value: "competition", label: "Competition" },
  { value: "team", label: "Team" },
];

export default function DocsPageClient() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => {
        setDocs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "all"
    ? docs
    : docs.filter((d) => d.category === activeCategory);

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  function getFileIcon(type: string) {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("sheet") || type.includes("excel")) return "📊";
    return "📎";
  }

  return (
    <div className="animate-in">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-cyan-50 via-blue-50/40 to-emerald-50 dark:from-cyan-950/20 dark:via-blue-950/10 dark:to-emerald-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <Badge variant="outline" className="mb-4 gap-1.5 text-xs">
            <FolderOpen className="h-3 w-3" />
            Documents
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Team Documents
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Download resources, competition materials, and documents from the Billistic Beaniez FLL team.
          </p>
        </div>
      </section>

      {/* Filter + Documents */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                  {cat.value !== "all" && (
                    <span className="ml-1.5 text-xs opacity-60">
                      {docs.filter((d) => d.category === cat.value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Documents */}
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <Card className="border-dashed max-w-md mx-auto">
                <CardContent className="pt-10 pb-10 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">
                    {docs.length === 0
                      ? "No documents uploaded yet. Check back soon!"
                      : "No documents in this category."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow group card-lift">
                    <CardContent className="pt-5 pb-5 px-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-2xl">{getFileIcon(doc.fileType)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                            {doc.title}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.fileName} • {formatSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {doc.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {CATEGORIES.find((c) => c.value === doc.category)?.label || doc.category}
                        </Badge>
                        <div className="flex-1" />
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs">
                            <ExternalLink className="h-3 w-3" />
                            View
                          </Button>
                        </a>
                        <a href={doc.fileUrl} download={doc.fileName}>
                          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs">
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
