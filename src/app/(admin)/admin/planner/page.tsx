"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  Upload,
  Trash2,
  Plus,
  CheckCircle,
  Save,
  RotateCcw,
  Image as ImageIcon,
} from "lucide-react";
import type { Mission, MissionOption, PlannerConfig } from "@/lib/planner/types";
import { DEFAULT_CONFIG, normalizeConfig, uid } from "@/lib/planner/defaults";
import { DEFAULT_MISSIONS } from "@/lib/planner/missions";

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

export default function AdminPlannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [config, setConfig] = useState<PlannerConfig>(DEFAULT_CONFIG);
  const [missions, setMissions] = useState<Mission[]>(DEFAULT_MISSIONS);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingMissions, setSavingMissions] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      try {
        const [cfgRes, misRes] = await Promise.all([
          fetch("/api/planner/config"),
          fetch("/api/planner/missions"),
        ]);
        const cfg = await cfgRes.json();
        const mis = await misRes.json();
        setConfig(normalizeConfig(cfg));
        if (Array.isArray(mis) && mis.length > 0) setMissions(mis as Mission[]);
      } catch {}
      setLoading(false);
    })();
  }, [session]);

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  }

  async function handleMatUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
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
      const res = await fetch("/api/planner/upload", { method: "POST", body: fd });
      const text = await res.text();
      let data: { url?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Upload failed: ${res.status}`);
      }
      if (!data.url) throw new Error(data.error || "Upload failed");
      const next = { ...config, matImageUrl: data.url };
      setConfig(next);
      await saveConfig(next);
      flash("Mat image updated");
    } catch (e) {
      setError(errorMessage(e, "Upload failed"));
      setTimeout(() => setError(""), 4000);
    }
    setUploading(false);
  }

  async function saveConfig(next: PlannerConfig = config) {
    setSavingConfig(true);
    try {
      const res = await fetch("/api/planner/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: next }),
      });
      if (!res.ok) throw new Error("Save failed");
      setConfig(normalizeConfig(await res.json()));
      flash("Settings saved");
    } catch (e) {
      setError(errorMessage(e, "Save failed"));
      setTimeout(() => setError(""), 4000);
    }
    setSavingConfig(false);
  }

  async function saveMissions() {
    setSavingMissions(true);
    try {
      const res = await fetch("/api/planner/missions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missions }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Save failed");
      }
      flash("Mission data saved");
    } catch (e) {
      setError(errorMessage(e, "Save failed"));
      setTimeout(() => setError(""), 4000);
    }
    setSavingMissions(false);
  }

  async function restoreMissions() {
    if (!confirm("Restore the official default mission data and discard your edits?")) return;
    try {
      const res = await fetch("/api/planner/missions", { method: "DELETE" });
      if (!res.ok) throw new Error("Restore failed");
      setMissions(DEFAULT_MISSIONS);
      flash("Defaults restored");
    } catch (e) {
      setError(errorMessage(e, "Restore failed"));
      setTimeout(() => setError(""), 4000);
    }
  }

  function updateMission(index: number, patch: Partial<Mission>) {
    setMissions((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function updateOption(missionIndex: number, optionIndex: number, patch: Partial<MissionOption>) {
    setMissions((prev) =>
      prev.map((m, i) =>
        i === missionIndex
          ? { ...m, options: m.options.map((o, j) => (j === optionIndex ? { ...o, ...patch } : o)) }
          : m
      )
    );
  }

  function addChecklistItem() {
    const label = newItem.trim();
    if (!label) return;
    setConfig((prev) => ({
      ...prev,
      checklistItems: [...prev.checklistItems, { id: uid(), label }],
    }));
    setNewItem("");
  }

  function removeChecklistItem(id: string) {
    setConfig((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((i) => i.id !== id),
    }));
  }

  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-sm">Planner Settings</h1>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Mat image, checklist, missions
            </span>
          </div>
          <div className="flex items-center gap-3">
            {error && <span className="text-xs text-destructive">{error}</span>}
            {notice && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> {notice}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="pt-6 pb-6 px-6">
                  <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Mat image
                  </h2>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex h-32 w-full sm:w-64 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-background">
                      {config.matImageUrl ? (
                        <img
                          src={config.matImageUrl}
                          alt="Current mat"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">No image set</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-xs text-muted-foreground">
                        The planner draws a placeholder grid until an official mat image is set.
                        PNG, JPEG, or WEBP up to 10MB.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50">
                          <Upload className="h-3.5 w-3.5" />
                          {uploading ? "Uploading…" : "Upload image"}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                            disabled={uploading}
                            onChange={handleMatUpload}
                          />
                        </label>
                        {config.matImageUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => {
                              setConfig((prev) => ({ ...prev, matImageUrl: "" }));
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove image
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={config.title}
                          onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Planner title"
                          className="h-8 max-w-xs text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          disabled={savingConfig}
                          onClick={() => saveConfig()}
                        >
                          <Save className="h-3.5 w-3.5" />
                          {savingConfig ? "Saving…" : "Save settings"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 pb-6 px-6">
                  <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Practice checklist items
                  </h2>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addChecklistItem();
                      }}
                      placeholder="New checklist item"
                      className="h-8 text-sm"
                    />
                    <Button size="sm" variant="outline" className="text-xs" onClick={addChecklistItem}>
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {config.checklistItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-md border bg-background px-3 py-2"
                      >
                        <span className="flex-1 text-xs">{item.label}</span>
                        <span className="text-[10px] text-muted-foreground">0 pts</span>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          aria-label="Remove item"
                          onClick={() => removeChecklistItem(item.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                    {config.checklistItems.length === 0 && (
                      <p className="text-xs text-muted-foreground">No custom items yet</p>
                    )}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      disabled={savingConfig}
                      onClick={() => saveConfig()}
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save checklist
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 pb-6 px-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold text-sm flex items-center gap-2">
                      <Map className="h-4 w-4" />
                      Mission scoring data
                    </h2>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs" onClick={restoreMissions}>
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore defaults
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="text-xs"
                        disabled={savingMissions}
                        onClick={saveMissions}
                      >
                        <Save className="h-3.5 w-3.5" />
                        {savingMissions ? "Saving…" : "Save missions"}
                      </Button>
                    </div>
                  </div>
                  <p className="mb-4 text-xs text-muted-foreground">
                    Points, labels and counts for M01 to M15. Leave the max count empty for missions
                    that score by count with no fixed maximum.
                  </p>
                  <div className="space-y-4">
                    {missions.map((mission, missionIndex) => (
                      <div key={mission.id} className="rounded-lg border bg-background p-3">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            {mission.code}
                          </Badge>
                          <Input
                            value={mission.name}
                            onChange={(e) => updateMission(missionIndex, { name: e.target.value })}
                            className="h-7 max-w-56 text-xs"
                          />
                          <Input
                            value={mission.summary}
                            onChange={(e) => updateMission(missionIndex, { summary: e.target.value })}
                            className="h-7 min-w-52 flex-1 text-xs"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          {mission.options.map((option, optionIndex) => (
                            <div
                              key={option.id}
                              className="flex flex-wrap items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5"
                            >
                              <Input
                                value={option.label}
                                onChange={(e) => updateOption(missionIndex, optionIndex, { label: e.target.value })}
                                className="h-7 min-w-44 flex-1 text-xs"
                              />
                              <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                pts
                                <Input
                                  type="number"
                                  value={option.points}
                                  onChange={(e) =>
                                    updateOption(missionIndex, optionIndex, {
                                      points: Number(e.target.value) || 0,
                                    })
                                  }
                                  className="h-7 w-16 text-xs"
                                />
                              </label>
                              {option.kind === "per" && (
                                <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  max
                                  <Input
                                    type="number"
                                    value={option.maxCount ?? ""}
                                    placeholder="var"
                                    onChange={(e) =>
                                      updateOption(missionIndex, optionIndex, {
                                        maxCount:
                                          e.target.value === ""
                                            ? undefined
                                            : Math.max(1, Number(e.target.value) || 1),
                                      })
                                    }
                                    className="h-7 w-16 text-xs"
                                  />
                                </label>
                              )}
                              <Badge variant="outline" className="text-[9px]">
                                {option.kind === "per" ? "each" : option.kind === "exclusive" ? "either or" : "one"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
