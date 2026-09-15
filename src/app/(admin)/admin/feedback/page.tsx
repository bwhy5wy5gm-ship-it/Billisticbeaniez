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
  MessageSquareText,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Calendar,
  ImagePlus,
  Building,
  User,
} from "lucide-react";

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

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FeedbackItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [company, setCompany] = useState("");
  const [person, setPerson] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchItems();
  }, [session]);

  function fetchItems() {
    fetch("/api/feedback")
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
    setCompany("");
    setPerson("");
    setPhotos([]);
    setShowForm(true);
  }

  function openEdit(item: FeedbackItem) {
    setEditing(item);
    setTitle(item.title);
    setDescription(item.description);
    setDate(item.date || "");
    setCompany(item.company || "");
    setPerson(item.person || "");
    setPhotos(item.photos || []);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setTitle("");
    setDescription("");
    setDate("");
    setCompany("");
    setPerson("");
    setPhotos([]);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) setPhotos((prev) => [...prev, data.url]);
    setUploading(false);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/feedback/${editing.id}` : "/api/feedback";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, date, company, person, photos }),
    });
    closeForm();
    fetchItems();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/feedback/${id}`, { method: "DELETE" });
    fetchItems();
  }

  if (status === "loading" || !session) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="secondary" className="mb-2 gap-1.5 text-xs border border-pink-200/60 dark:border-pink-800/60 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300">
              <MessageSquareText className="h-3 w-3" />
              Feedback
            </Badge>
            <h1 className="text-3xl font-bold">Manage Feedback</h1>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Feedback
          </Button>
        </div>

        {showForm && (
          <Card className="border-2 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {editing ? "Edit Feedback" : "New Feedback"}
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5">Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Feedback title" className="h-10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      Date
                    </label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-muted-foreground" />
                      Company / Organization
                    </label>
                    <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company or organization name" className="h-10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      Person
                    </label>
                    <Input value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Person's name" className="h-10" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5">Description</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write feedback details..." rows={5} className="resize-none" />
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
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2 animate-pulse"><CardContent className="pt-5"><div className="h-4 bg-muted rounded w-1/3 mb-2" /></CardContent></Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-5">
              <div className="text-center py-12">
                <MessageSquareText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-medium text-muted-foreground">No feedback yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="border-2">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs font-mono">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(item.date).toLocaleDateString()}
                        </Badge>
                        {item.person && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.person}
                          </span>
                        )}
                        {item.company && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {item.company}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description.slice(0, 120)}...</p>
                      {item.photos.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {item.photos.slice(0, 3).map((url, i) => (
                            <img key={i} src={url} alt="" className="h-10 w-10 rounded border object-cover" />
                          ))}
                          {item.photos.length > 3 && (
                            <span className="text-xs text-muted-foreground self-center">+{item.photos.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => handleDelete(item.id)}>
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
