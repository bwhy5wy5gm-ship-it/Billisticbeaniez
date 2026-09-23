"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Trash2,
  Download,
  ExternalLink,
  Plus,
  CheckCircle,
} from "lucide-react";
import { invalidateContent } from "@/lib/use-content";

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
  { value: "general", label: "General" },
  { value: "robot", label: "Robot" },
  { value: "innovation", label: "Innovation Project" },
  { value: "core-values", label: "Core Values" },
  { value: "competition", label: "Competition" },
  { value: "team", label: "Team" },
];

export default function DocsAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchDocs();
  }, [session]);

  async function fetchDocs() {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!title) {
      setError("Please enter a title first");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadText = await uploadRes.text();
      let uploadData: any;
      try {
        uploadData = JSON.parse(uploadText);
      } catch {
        throw new Error("Upload failed: " + uploadRes.status + " " + uploadText.substring(0, 100));
      }
      if (!uploadData.url) throw new Error(uploadData.error || "Upload failed");

      const docRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          fileUrl: uploadData.url,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        }),
      });
      const docText = await docRes.text();
      let docData: any;
      try {
        docData = JSON.parse(docText);
      } catch {
        throw new Error("Failed to save document: " + docRes.status);
      }
      if (docData.error) throw new Error(docData.error);

      setTitle("");
      setDescription("");
      setCategory("general");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      invalidateContent();
      fetchDocs();
    } catch (e: any) {
      setError(e.message || "Upload failed");
      setTimeout(() => setError(""), 4000);
    }
    setUploading(false);
  }

  async function deleteDoc(id: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchDocs();
    } catch {}
  }

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

  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-sm">Manage Documents</h1>
            <span className="text-xs text-muted-foreground hidden sm:inline">{docs.length} documents</span>
          </div>
          {saved && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Saved
            </span>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Form */}
          <Card>
            <CardContent className="pt-6 pb-6 px-6">
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload New Document
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document title"
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border bg-background text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document"
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <FileText className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Choose File to Upload"}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.gif,.webp"
                    disabled={uploading}
                    onChange={handleUpload}
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-2">PDF, Word, Excel, images, and text files supported</p>
                {error && <p className="text-xs text-destructive mt-2">{error}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <div>
            <h2 className="font-semibold text-sm mb-3">Uploaded Documents</h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : docs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-8 pb-8 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {docs.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="pt-4 pb-4 px-4 flex items-center gap-4">
                      <div className="text-2xl">{getFileIcon(doc.fileType)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{doc.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {doc.fileName} • {formatSize(doc.fileSize)}
                        </p>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{doc.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {CATEGORIES.find((c) => c.value === doc.category)?.label || doc.category}
                      </Badge>
                      <div className="flex items-center gap-1 shrink-0">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                        <a href={doc.fileUrl} download={doc.fileName}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => deleteDoc(doc.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
