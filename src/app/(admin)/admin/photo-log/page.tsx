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
  Camera,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Calendar,
  ImagePlus,
} from "lucide-react";

const groups = [
  { value: "robot", label: "Robot" },
  { value: "innovation", label: "Innovation" },
  { value: "team", label: "Team" },
  { value: "corevalues", label: "Core Values" },
  { value: "competition", label: "Competition" },
];

interface PhotoItem {
  id: number;
  title: string;
  description: string;
  date: string;
  group: string;
  photos: string[];
  createdAt: string;
}

export default function AdminPhotoLogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PhotoItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [group, setGroup] = useState("robot");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [filterGroup, setFilterGroup] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchItems();
  }, [session]);

  function fetchItems() {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  function openNew() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setGroup("robot");
    setPhotos([]);
    setShowForm(true);
  }

  function openEdit(item: PhotoItem) {
    setEditing(item);
    setTitle(item.title);
    setDescription(item.description);
    setDate(item.date || "");
    setGroup(item.group || "robot");
    setPhotos(item.photos || []);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setTitle("");
    setDescription("");
    setDate("");
    setGroup("robot");
    setPhotos([]);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Upload failed");
      } else {
        setPhotos((prev) => [...prev, data.url]);
      }
    } catch (e: any) {
      setError(e.message || "Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    if (!date) { setError("Date is required"); return; }
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/photos/${editing.id}` : "/api/photos";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, group, photos }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      closeForm();
      fetchItems();
    } catch (e: any) {
      setError(e.message || "Failed to save");
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    fetchItems();
  }

  const filteredItems = filterGroup === "all" ? items : items.filter((i) => i.group === filterGroup);

  if (status === "loading" || !session) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="secondary" className="mb-2 gap-1.5 text-xs border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300">
              <Camera className="h-3 w-3" />
              Photo Log
            </Badge>
            <h1 className="text-3xl font-bold">Manage Photo Log</h1>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Photo
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filterGroup === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterGroup("all")}
          >
            All
          </Button>
          {groups.map((g) => (
            <Button
              key={g.value}
              variant={filterGroup === g.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterGroup(g.value)}
            >
              {g.label}
            </Button>
          ))}
        </div>

        {showForm && (
          <Card className="border-2 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {editing ? "Edit Photo Entry" : "New Photo Entry"}
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5">Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Photo title" className="h-10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      Date
                    </label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5">Group</label>
                    <select
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {groups.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5">Description</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." rows={3} className="resize-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
                    Photos
                  </label>
                  <Input type="file" accept="image/*" onChange={handlePhotoUpload} className="h-10" />
                  {uploading && <span className="text-xs text-muted-foreground mt-1">Uploading...</span>}
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {photos.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt="" className="h-16 w-16 rounded-lg border object-cover" />
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2 animate-pulse overflow-hidden">
                <div className="aspect-[4/3] bg-muted" />
                <CardContent className="pt-4"><div className="h-4 bg-muted rounded w-2/3" /></CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-5">
              <div className="text-center py-12">
                <Camera className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-medium text-muted-foreground">No photos yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="border-2 overflow-hidden">
                {item.photos && item.photos.length > 0 ? (
                  <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                    <img src={item.photos[0]} alt="" className="h-full w-full object-contain bg-muted" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs font-mono">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(item.date).toLocaleDateString()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {item.group}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <div className="flex gap-1.5 mt-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
