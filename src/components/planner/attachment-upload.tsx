"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttachmentUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  compact?: boolean;
}

export function AttachmentUpload({ value, onChange, compact }: AttachmentUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/planner/attachment", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}) as { url?: string; error?: string });
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Upload failed");
    }
    setBusy(false);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleFile}
      />
      {value ? (
        <div className={`flex items-center gap-3 ${compact ? "" : "rounded-lg border bg-background p-2"}`}>
          <img
            src={value}
            alt="Attachment for this run"
            className={`shrink-0 rounded-md border bg-white object-contain ${
              compact ? "h-14 w-14" : "h-20 w-20"
            }`}
          />
          <div className="flex min-w-0 flex-col items-start gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {busy ? "Uploading" : "Replace image"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-xs"
              disabled={busy}
              onClick={() => onChange(undefined)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove image
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {busy ? "Uploading" : compact ? "Add image" : "Upload attachment photo"}
        </Button>
      )}
      {error && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
