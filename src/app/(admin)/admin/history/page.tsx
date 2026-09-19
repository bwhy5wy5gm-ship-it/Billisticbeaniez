"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  ImagePlus,
} from "lucide-react";

interface HistoryEntry {
  id: string;
  year: number;
  title: string;
  description: string;
  photos: string[];
}

export default function AdminHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HistoryEntry | null>(null);
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchEntries();
  }, [session]);

  function fetchEntries() {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.map((h: any) => ({ ...h, photos: h.photos || [] })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  function openNew() {
    setEditing(null);
    setYear(String(new Date().getFullYear()));
    setTitle("");
    setDescription("");
    setPhotos([]);
    setShowForm(true);
  }

  function openEdit(entry: HistoryEntry) {
    setEditing(entry);
    setYear(String(entry.year));
    setTitle(entry.title);
    setDescription(entry.description);
    setPhotos(entry.photos || []);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setYear("");
    setTitle("");
    setDescription("");
    setPhotos([]);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Photo upload failed");
      } else if (data.url) {
        setPhotos((prev) => [...prev, data.url]);
      }
    } catch {
      setError("Photo upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError("");
    if (!year || !title || !description) {
      setError("Year, title, and description are required");
      return;
    }
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/history/${editing.id}` : "/api/history";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: Number(year), title, description, photos }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save entry");
        return;
      }
      closeForm();
      fetchEntries();
    } catch {
      setError("Failed to save entry");
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/history/${id}`, { method: "DELETE" });
    fetchEntries();
  }

  if (status === "loading" || !session) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="secondary" className="mb-2 gap-1.5 text-xs border border-cyan-200/60 dark:border-cyan-800/60 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300">
              <Calendar className="h-3 w-3" />
              Team History
            </Badge>
            <h1 className="text-3xl font-bold">Manage Team History</h1>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>

        {showForm && (
          <Card className="border-2 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {editing ? "Edit Entry" : "New Entry"}
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      Year
                    </label>
                    <Input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="e.g. 2025"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5">Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Entry title"
                      className="h-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this milestone..."
                    rows={6}
                    className="resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
                    Photos
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="h-10"
                  />
                  {uploading && (
                    <span className="text-xs text-muted-foreground mt-1">Uploading...</span>
                  )}
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {photos.map((url, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={url}
                            alt=""
                            className="h-16 w-16 rounded-lg border object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-5 w-5 absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                            onClick={() => removePhoto(i)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  {editing ? "Update" : "Publish"}
                </Button>
                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2 animate-pulse">
                <CardContent className="pt-5">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-5">
              <div className="text-center py-12">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-medium text-muted-foreground">No history entries yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Create your first team history entry.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {[...entries]
              .sort((a, b) => b.year - a.year)
              .map((entry) => (
                <Card key={entry.id} className="border-2">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            <Calendar className="h-3 w-3 mr-1" />
                            {entry.year}
                          </Badge>
                          {entry.photos && entry.photos.length > 0 && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <ImagePlus className="h-3 w-3" />
                              {entry.photos.length} photo{entry.photos.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mb-1">{entry.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {entry.description.slice(0, 120)}
                          {entry.description.length > 120 ? "..." : ""}
                        </p>
                        {entry.photos && entry.photos.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {entry.photos.slice(0, 3).map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt=""
                                className="h-10 w-10 rounded border object-cover"
                              />
                            ))}
                            {entry.photos.length > 3 && (
                              <span className="text-xs text-muted-foreground self-center">
                                +{entry.photos.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(entry)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
