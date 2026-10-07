"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Download,
  FileJson,
  FileSpreadsheet,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useContent } from "@/lib/use-content";
import { MatCanvas } from "@/components/planner/mat-canvas";
import { DEFAULT_MISSIONS, totalForRun } from "@/lib/planner/missions";
import type { Mission, PlannerConfig, PlannerStore, Run } from "@/lib/planner/types";
import {
  PLANS_KEY,
  TIMER_SECONDS,
  createStore,
  createPlan,
  guestOwner,
  userDeviceOwner,
  normalizeConfig,
  normalizeStore,
  resolveSettings,
  uid,
} from "@/lib/planner/defaults";
import {
  buildPlanData,
  buildRunsCsv,
  buildRunsJson,
  downloadBlob,
  extractRuns,
  parseCsv,
  serializeSvgToMarkup,
  slugify,
  type ExportedRun,
  type PlanData,
} from "@/lib/planner/export";

type Format = "json" | "csv" | "svg";
type SessionUser = { id?: string };

type Parsed =
  | { kind: "runs"; entries: ExportedRun[]; fileName: string }
  | { kind: "csv"; headers: string[]; rows: string[][]; fileName: string }
  | { kind: "image"; url: string; fileName: string };

interface Entry {
  key: string;
  planName: string;
  createdAt: string;
  showHeading: boolean;
  run: Run;
  planData?: PlanData;
}

const FORMATS: { id: Format; label: string; hint: string; icon: typeof FileJson }[] = [
  {
    id: "json",
    label: "JSON",
    hint: "Complete run data, upload it later to import back into the planner",
    icon: FileJson,
  },
  {
    id: "csv",
    label: "CSV",
    hint: "Spreadsheet table with every selected run and its score",
    icon: FileSpreadsheet,
  },
  {
    id: "svg",
    label: "SVG",
    hint: "Picture of the mat with the route of the first selected run",
    icon: ImageIcon,
  },
];

export function PlannerDownloads() {
  const { data: session, status } = useSession();
  const { getContent } = useContent();
  const previewRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string>("");

  const [owner, setOwner] = useState<string | null>(null);
  const [store, setStore] = useState<PlannerStore | null>(null);
  const [missions, setMissions] = useState<Mission[]>(DEFAULT_MISSIONS);
  const [config, setConfig] = useState<PlannerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<Format>("json");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    const userId = (session?.user as SessionUser | undefined)?.id;
    const nextOwner =
      status === "authenticated" && userId ? userDeviceOwner(userId) : guestOwner();
    let alive = true;
    (async () => {
      const [cfg, mis, plans] = await Promise.all([
        fetch("/api/planner/config")
          .then((r) => r.json())
          .catch(() => null),
        fetch("/api/planner/missions")
          .then((r) => r.json())
          .catch(() => null),
        fetch(`/api/planner/plans?owner=${encodeURIComponent(nextOwner)}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);
      if (!alive) return;
      if (cfg) setConfig(normalizeConfig(cfg));
      if (Array.isArray(mis) && mis.length > 0) setMissions(mis as Mission[]);
      let nextStore: PlannerStore | null = null;
      try {
        const local = localStorage.getItem(PLANS_KEY);
        if (local) {
          nextStore = normalizeStore(JSON.parse(local));
          if (!nextStore) {
            try {
              localStorage.setItem(`${PLANS_KEY}.backup`, local);
            } catch {}
          }
        }
      } catch {}
      if (!nextStore) nextStore = normalizeStore(plans?.store ?? null);
      if (!alive) return;
      setOwner(nextOwner);
      setStore(nextStore);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [status, session]);

  const entries = useMemo<Entry[]>(() => {
    if (!store) return [];
    const list: Entry[] = [];
    for (const plan of store.plans) {
      const showHeading = resolveSettings(plan).showHeading;
      const planData = buildPlanData(plan);
      for (const run of plan.runs) {
        list.push({
          key: `${plan.id}:${run.id}`,
          planName: plan.name,
          createdAt: plan.createdAt,
          showHeading,
          run,
          ...(planData ? { planData } : {}),
        });
      }
    }
    return list;
  }, [store]);

  const allChecked = entries.length > 0 && checked.size === entries.length;
  const selectedEntries = entries.filter((e) => checked.has(e.key));
  const previewEntry = selectedEntries[0] ?? entries[0] ?? null;

  function flashError(message: string) {
    setError(message);
    setTimeout(() => setError(""), 5000);
  }

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    setChecked(allChecked ? new Set() : new Set(entries.map((e) => e.key)));
  }

  function handleDownload() {
    if (selectedEntries.length === 0) {
      flashError("Choose at least one run to download");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === "json") {
      downloadBlob(
        `beanie-runs-${stamp}.json`,
        "application/json",
        buildRunsJson(
          selectedEntries.map((e) => ({
            planName: e.planName,
            createdAt: e.createdAt,
            run: e.run,
            ...(e.planData ? { planData: e.planData } : {}),
          }))
        )
      );
    } else if (format === "csv") {
      downloadBlob(
        `beanie-runs-${stamp}.csv`,
        "text/csv;charset=utf-8",
        buildRunsCsv(selectedEntries, missions)
      );
    } else {
      const svg = previewRef.current?.querySelector("svg");
      if (!svg || !previewEntry) {
        flashError("Preview is not ready yet");
        return;
      }
      downloadBlob(`${slugify(previewEntry.run.name)}.svg`, "image/svg+xml", serializeSvgToMarkup(svg));
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setNotice("");
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
    const lower = file.name.toLowerCase();
    try {
      if (lower.endsWith(".json")) {
        const data = JSON.parse(await file.text());
        setParsed({ kind: "runs", entries: extractRuns(data), fileName: file.name });
      } else if (lower.endsWith(".csv")) {
        const { headers, rows } = parseCsv(await file.text());
        if (headers.length === 0) throw new Error("That CSV file looks empty");
        setParsed({ kind: "csv", headers, rows, fileName: file.name });
      } else if (lower.endsWith(".svg") || file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        objectUrlRef.current = url;
        setParsed({ kind: "image", url, fileName: file.name });
      } else {
        throw new Error("Choose a JSON, CSV, or SVG file that you downloaded");
      }
    } catch (err) {
      setParsed(null);
      flashError(err instanceof Error && err.message ? err.message : "Could not read that file");
    }
  }

  async function importRuns() {
    if (parsed?.kind !== "runs" || !owner || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (parsed.entries.length === 0) throw new Error("No runs found in that file");
      const sourceName = parsed.entries.find((e) => e.planName && e.planName !== "Imported")
        ?.planName;
      const plan = createPlan(
        sourceName ? `Imported ${sourceName}` : `Imported ${new Date().toLocaleDateString()}`
      );
      const planData = parsed.entries.find((e) => e.planData)?.planData;
      if (planData?.notes) plan.notes = planData.notes;
      if (planData?.risk) plan.risk = planData.risk;
      if (planData?.practice) plan.practice = planData.practice;
      if (planData?.settings) plan.settings = planData.settings;
      plan.runs = parsed.entries.map((e) => ({ ...e.run, id: uid() }));
      plan.activeRunId = plan.runs[0].id;
      const base = store ?? createStore();
      const candidate: PlannerStore = {
        version: base.version,
        plans: [...base.plans, plan],
        activePlanId: plan.id,
      };
      const normalized = normalizeStore(candidate);
      if (!normalized) throw new Error("Could not build planner data from that file");
      const res = await fetch("/api/planner/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, store: normalized }),
      });
      const data = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok || data.error) throw new Error(data.error || "Import failed");
      try {
        localStorage.setItem(PLANS_KEY, JSON.stringify(normalized));
      } catch {}
      setStore(normalized);
      setChecked(new Set(plan.runs.map((r) => `${plan.id}:${r.id}`)));
      setNotice(`Imported ${plan.runs.length} ${plan.runs.length === 1 ? "run" : "runs"} into ${plan.name}`);
    } catch (err) {
      flashError(err instanceof Error && err.message ? err.message : "Import failed");
    }
    setBusy(false);
  }

  function clearParsed() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
    setParsed(null);
    setNotice("");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-pattern text-sm text-foreground">
        Loading downloads…
      </div>
    );
  }

  const robotImageUrl = getContent("robot.image", "");
  const robotImageRotation = parseInt(getContent("robot.image.rotate", "0"), 10) || 0;

  return (
    <div className="min-h-screen bg-page-pattern">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/planner"
              className="flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Planner
            </Link>
            <h1 className="text-sm font-bold">Downloads</h1>
          </div>
          <span className="hidden text-xs text-foreground sm:inline">
            Download runs, or upload a file to see its contents
          </span>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Download className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                Download runs
              </h2>
              {entries.length > 0 && (
                <Button size="xs" variant="outline" onClick={toggleAll}>
                  {allChecked ? "Clear selection" : "Select all runs"}
                </Button>
              )}
            </div>

            <p className="text-xs text-foreground">
              Auto save is off in the planner, so download your runs to keep them and upload the
              file here when you want them back.
            </p>

            {entries.length === 0 ? (
              <p className="text-sm text-foreground">
                No runs saved yet. Draw a route in the planner first, then come back here to
                download it.
              </p>
            ) : (
              <>
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {entries.map((entry) => {
                    const totals = totalForRun(missions, entry.run.selections, entry.run.checklist);
                    return (
                      <label
                        key={entry.key}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={checked.has(entry.key)}
                          onChange={() => toggle(entry.key)}
                          className="h-4 w-4 accent-cyan-600"
                        />
                        <span className="min-w-0 flex-1 text-sm" title={`${entry.planName} / ${entry.run.name}`}>
                          {entry.planName}
                          <span className="text-foreground"> / </span>
                          {entry.run.name}
                        </span>
                        <span className="text-xs text-foreground">
                          {entry.run.waypoints.length}{" "}
                          {entry.run.waypoints.length === 1 ? "waypoint" : "waypoints"}
                        </span>
                        <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums">
                          {totals.variableMissions > 0 && totals.total > 0 ? "≥" : ""}
                          {totals.total}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {FORMATS.map((f) => {
                    const Icon = f.icon;
                    const active = format === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setFormat(f.id)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          active
                            ? "border-cyan-600 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/40"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 text-sm font-semibold">
                          <Icon className="h-4 w-4" />
                          {f.label}
                        </span>
                        <span className="mt-1 block text-xs leading-snug text-foreground">
                          {f.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={handleDownload} disabled={selectedEntries.length === 0}>
                    <Download className="h-4 w-4" />
                    Download {selectedEntries.length}{" "}
                    {selectedEntries.length === 1 ? "run" : "runs"} as {format.toUpperCase()}
                  </Button>
                  {selectedEntries.length === 0 && (
                    <span className="text-xs text-foreground">
                      Tick the runs you want above
                    </span>
                  )}
                </div>
              </>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {previewEntry && (
          <Card>
            <CardContent className="space-y-3 pt-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                Preview
              </h2>
              <p className="text-xs text-foreground">
                Showing {previewEntry.planName} / {previewEntry.run.name}. The SVG download saves
                this picture of the mat with the route.
              </p>
              <div ref={previewRef}>
                <MatCanvas
                  matImageUrl={config?.matImageUrl ?? ""}
                  tool="select"
                  waypoints={previewEntry.run.waypoints}
                  paths={previewEntry.run.paths}
                  robot={previewEntry.run.robot}
                  selected={null}
                  draft={[]}
                  simRunning={false}
                  simDurationMs={TIMER_SECONDS * 1000}
                  robotImageUrl={robotImageUrl}
                  robotImageRotation={robotImageRotation}
                  showHeading={previewEntry.showHeading}
                  onChange={() => {}}
                  onDraftChange={() => {}}
                  onSelect={() => {}}
                  onPathFinish={() => {}}
                  onToolDone={() => {}}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Upload className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              Upload a file
            </h2>
            <p className="text-xs text-foreground">
              Choose a file you downloaded to see its contents here. JSON files can be imported
              back into your planner, CSV opens as a table, and SVG shows the picture.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex">
                <input type="file" className="hidden" accept=".json,.csv,.svg" onChange={handleFile} />
                <span className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-muted">
                  <Upload className="h-3.5 w-3.5" />
                  Choose file
                </span>
              </label>
              {parsed && (
                <Button size="xs" variant="ghost" onClick={clearParsed}>
                  Remove file
                </Button>
              )}
            </div>

            {parsed?.kind === "runs" && (
              <div className="overflow-hidden rounded-lg border">
                <div className="border-b bg-muted/40 px-3 py-2 text-xs font-medium">
                  {parsed.fileName}, {parsed.entries.length}{" "}
                  {parsed.entries.length === 1 ? "run" : "runs"} found
                </div>
                <div className="max-h-56 overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-foreground">
                        <th className="px-3 py-1.5 text-left font-medium">Plan</th>
                        <th className="px-3 py-1.5 text-left font-medium">Run</th>
                        <th className="px-3 py-1.5 text-left font-medium">Waypoints</th>
                        <th className="px-3 py-1.5 text-left font-medium">Missions</th>
                        <th className="px-3 py-1.5 text-right font-medium">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.entries.map((entry, i) => {
                        const totals = totalForRun(missions, entry.run.selections, entry.run.checklist);
                        const chosen = missions.filter(
                          (m) => (entry.run.selections[m.id] ? Object.keys(entry.run.selections[m.id]).length : 0) > 0
                        ).length;
                        return (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="px-3 py-1.5">{entry.planName}</td>
                            <td className="px-3 py-1.5">{entry.run.name}</td>
                            <td className="px-3 py-1.5">{entry.run.waypoints?.length ?? 0}</td>
                            <td className="px-3 py-1.5">{chosen}</td>
                            <td className="px-3 py-1.5 text-right font-mono font-bold">
                              {totals.variableMissions > 0 && totals.total > 0 ? "≥" : ""}
                              {totals.total}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center gap-3 border-t bg-muted/30 px-3 py-2">
                  <Button size="xs" onClick={importRuns} disabled={busy}>
                    {busy ? "Importing…" : "Import into planner"}
                  </Button>
                  {notice && (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      {notice}
                      <Link href="/planner" className="font-medium underline">
                        Open planner
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            )}

            {parsed?.kind === "csv" && (
              <div className="overflow-hidden rounded-lg border">
                <div className="border-b bg-muted/40 px-3 py-2 text-xs font-medium">
                  {parsed.fileName}, {parsed.rows.length}{" "}
                  {parsed.rows.length === 1 ? "row" : "rows"}
                </div>
                <div className="max-h-56 overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        {parsed.headers.map((h, i) => (
                          <th key={i} className="whitespace-nowrap px-3 py-1.5 text-left font-medium text-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.rows.map((row, i) => (
                        <tr key={i} className="border-b last:border-b-0">
                          {row.map((cell, j) => (
                            <td key={j} className="whitespace-nowrap px-3 py-1.5">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="border-t bg-muted/30 px-3 py-2 text-xs text-foreground">
                  CSV is for spreadsheets. Upload the JSON version to import runs back into the
                  planner.
                </p>
              </div>
            )}

            {parsed?.kind === "image" && (
              <div className="overflow-hidden rounded-lg border">
                <div className="border-b bg-muted/40 px-3 py-2 text-xs font-medium">
                  {parsed.fileName}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={parsed.url}
                  alt={parsed.fileName}
                  className="mx-auto max-h-72 bg-white p-2"
                />
              </div>
            )}

            {error && !parsed && <p className="text-xs text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
