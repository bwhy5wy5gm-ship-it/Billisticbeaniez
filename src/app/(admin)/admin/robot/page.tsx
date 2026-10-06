"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Upload,
  Trash2,
  ExternalLink,
  CheckCircle,
  RotateCcw,
  RotateCw,
  ImageIcon,
} from "lucide-react";
import { useContent, invalidateContent } from "@/lib/use-content";

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

function normalizeRotation(value: string): number {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return ((parsed % 360) + 360) % 360;
}

export default function AdminRobotPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getContent } = useContent();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const image = getContent("robot.image", "");
  const rotation = normalizeRotation(getContent("robot.image.rotate", "0"));

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  }

  async function saveKey(key: string, value: string) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const text = await res.text();
      let data: { error?: string; success?: boolean };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Save failed: ${res.status}`);
      }
      if (!res.ok || data.error) throw new Error(data.error || `Save failed (${res.status})`);
      invalidateContent();
      flash("Saved");
    } catch (e) {
      setError(errorMessage(e, "Save failed"));
      setTimeout(() => setError(""), 4000);
    }
    setSaving(false);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      setTimeout(() => setError(""), 4000);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image is too large. Maximum size is 10MB.");
      setTimeout(() => setError(""), 4000);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const text = await res.text();
      let data: { url?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Upload failed: ${res.status}`);
      }
      if (!data.url) throw new Error(data.error || "Upload failed");
      await saveKey("robot.image", data.url);
      flash("Robot photo updated");
    } catch (e) {
      setError(errorMessage(e, "Upload failed"));
      setTimeout(() => setError(""), 4000);
    }
    setUploading(false);
  }

  function rotateBy(delta: number) {
    void saveKey("robot.image.rotate", String(normalizeRotation(String(rotation + delta))));
  }

  if (status === "loading" || !session) return null;

  const rotated = rotation === 90 || rotation === 270;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-sm">Robot</h1>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Robot photo for the planner and robot page
            </span>
          </div>
          <div className="flex items-center gap-3">
            {error && <span className="text-xs text-destructive">{error}</span>}
            {(saving || uploading) && (
              <span className="text-xs text-muted-foreground">
                {uploading ? "Uploading…" : "Saving…"}
              </span>
            )}
            {notice && !saving && !uploading && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> {notice}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="gap-1.5 text-xs border border-cyan-200/60 dark:border-cyan-800/60 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
            >
              <Bot className="h-3 w-3" />
              Robot
            </Badge>
            <span className="text-xs text-muted-foreground">
              A top view photo works best, shot straight down with the whole robot in frame
            </span>
          </div>

          <Card>
            <CardContent className="pt-6 pb-6 px-6">
              <h2 className="font-semibold text-sm mb-1 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Robot photo, top view recommended
              </h2>
              <p className="mb-4 text-xs text-muted-foreground">
                This photo is used as the robot that moves on the planner mat, and it is shown at
                the top of the public robot page. Place the robot on a plain background, point the
                camera straight down, and keep every wheel and attachment inside the frame. A
                top view photo works best.
              </p>

              {image ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center rounded-xl border bg-muted/40 p-4 sm:p-6">
                    <img
                      src={image}
                      alt="Robot photo preview"
                      className={`object-contain rounded-lg ${
                        rotated ? "max-h-[360px] w-auto max-w-[360px]" : "max-h-[360px] w-auto max-w-full"
                      }`}
                      style={{ transform: `rotate(${rotation}deg)` }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      disabled={uploading || saving}
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? "Uploading…" : "Replace photo"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      disabled={saving}
                      onClick={() => rotateBy(-90)}
                      aria-label="Rotate left"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Rotate left
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      disabled={saving}
                      onClick={() => rotateBy(90)}
                      aria-label="Rotate right"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      Rotate right
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-destructive"
                      disabled={saving}
                      onClick={() => {
                        if (confirm("Remove the robot photo?")) {
                          void saveKey("robot.image", "");
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                    <Link href="/robot" target="_blank" className="ml-auto">
                      <Button size="sm" variant="ghost" className="text-xs">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View robot page
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-12 transition-colors hover:bg-muted/50 ${
                    uploading ? "pointer-events-none opacity-60" : ""
                  }`}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {uploading ? "Uploading…" : "Upload top view photo"}
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    PNG, JPEG, or WEBP up to 10MB
                  </span>
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                disabled={uploading}
                onChange={handleFile}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-6 px-6">
              <h2 className="font-semibold text-sm mb-2">Other robot content</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Robot name, description, feature cards, and attachments are edited in the Pages
                editor. The photo above moves on the planner mat and shows at the top of the robot
                page hero area.
              </p>
              <Link href="/admin/pages">
                <Button size="sm" variant="outline" className="mt-3 text-xs">
                  Open Pages editor
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
