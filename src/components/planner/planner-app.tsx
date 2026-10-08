"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Ban,
  BarChart3,
  Bot,
  Download,
  Eraser,
  Flag,
  Info,
  Layers,
  ListChecks,
  MapPin,
  MousePointer2,
  Pencil,
  Plus,
  RotateCcw,
  Route,
  Settings,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useContent } from "@/lib/use-content";
import { MatCanvas, type Selected, type Tool } from "@/components/planner/mat-canvas";
import { AnalysisModal } from "@/components/planner/analysis-modal";
import { InfoModal } from "@/components/planner/info-modal";
import { AttachmentUpload } from "@/components/planner/attachment-upload";
import { Timer } from "@/components/planner/timer";
import { MissionsPanel } from "@/components/planner/missions-panel";
import { ChecklistPanel } from "@/components/planner/checklist-panel";
import { analysePlan } from "@/lib/planner/analysis";
import { DEFAULT_MISSIONS, totalForRun } from "@/lib/planner/missions";
import type {
  Mission,
  PathPoint,
  Plan,
  PlannerConfig,
  PlannerStore,
  PlanSettings,
  Run,
} from "@/lib/planner/types";
import {
  DEFAULT_CONFIG,
  PLANS_KEY,
  TIMER_SECONDS,
  activePlan,
  activeRun,
  createPlan,
  createRun,
  createStore,
  guestOwner,
  userDeviceOwner,
  normalizeConfig,
  normalizeStore,
  resolveSettings,
  robotSize,
} from "@/lib/planner/defaults";

type TabValue = "missions" | "checklist" | "notes" | "runs" | "settings";
type SessionUser = { id?: string; isAdmin?: boolean };

const LINE_COLORS: { value: string; swatch: string; label: string }[] = [
  { value: "", swatch: "rgba(6,182,212,.8)", label: "Default cyan" },
  { value: "#10b981", swatch: "#10b981", label: "Emerald" },
  { value: "#0ea5e9", swatch: "#0ea5e9", label: "Sky" },
  { value: "#8b5cf6", swatch: "#8b5cf6", label: "Violet" },
  { value: "#f59e0b", swatch: "#f59e0b", label: "Amber" },
  { value: "#f43f5e", swatch: "#f43f5e", label: "Rose" },
  { value: "#f97316", swatch: "#f97316", label: "Orange" },
  { value: "#475569", swatch: "#475569", label: "Slate" },
];

const TOOLS: { id: Tool; icon: typeof MousePointer2; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select and move" },
  { id: "waypoint", icon: MapPin, label: "Add waypoint" },
  { id: "path", icon: Route, label: "Draw path" },
  { id: "robot", icon: Bot, label: "Place robot" },
  { id: "erase", icon: Eraser, label: "Erase item" },
];

export function PlannerApp() {
  const { data: session, status } = useSession();
  const { getContent } = useContent();
  const [store, setStore] = useState<PlannerStore | null>(null);
  const [config, setConfig] = useState<PlannerConfig>(DEFAULT_CONFIG);
  const [missions, setMissions] = useState<Mission[]>(DEFAULT_MISSIONS);
  const [tab, setTab] = useState<TabValue>("missions");
  const [lineColor, setLineColor] = useState("");
  const [renameTarget, setRenameTarget] = useState<
    { type: "plan" | "run"; planId: string; runId?: string } | null
  >(null);
  const [tool, setTool] = useState<Tool>("select");
  const [selected, setSelected] = useState<Selected>(null);
  const [draft, setDraft] = useState<PathPoint[]>([]);
  const [timerRemaining, setTimerRemaining] = useState(TIMER_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [simEpoch, setSimEpoch] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [settingsEpoch, setSettingsEpoch] = useState(0);
  const loadedForRef = useRef<string | null>(null);
  const loadSeqRef = useRef(0);
  const renameCancelledRef = useRef(false);

  const robotImageUrl = getContent("robot.image", "");
  const robotImageRotation = parseInt(getContent("robot.image.rotate", "0"), 10) || 0;

  useEffect(() => {
    if (status === "loading") return;
    const sessionUser = session?.user as SessionUser | undefined;
    const nextOwner =
      status === "authenticated" && sessionUser?.id
        ? userDeviceOwner(sessionUser.id)
        : guestOwner();
    if (loadedForRef.current === nextOwner) return;
    loadedForRef.current = nextOwner;
    const seq = ++loadSeqRef.current;

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
      if (seq !== loadSeqRef.current) return;
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
      if (seq !== loadSeqRef.current) return;
      setStore(nextStore ?? createStore());
    })();
  }, [status, session]);

  useEffect(() => {
    if (!store) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(PLANS_KEY, JSON.stringify(store));
      } catch {}
    }, 400);
    return () => window.clearTimeout(timer);
  }, [store]);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  function resetTimer() {
    setTimerRunning(false);
    setTimerRemaining(TIMER_SECONDS);
    setSimEpoch((epoch) => epoch + 1);
  }

  function updateStore(updater: (s: PlannerStore) => PlannerStore) {
    setStore((prev) => (prev ? updater(prev) : prev));
  }

  function updatePlan(fn: (plan: Plan) => Plan) {
    updateStore((s) => ({
      ...s,
      plans: s.plans.map((p) => (p.id === s.activePlanId ? fn(p) : p)),
    }));
  }

  function updateRun(fn: (run: Run) => Run) {
    updatePlan((p) => ({
      ...p,
      runs: p.runs.map((r) => (r.id === p.activeRunId ? fn(r) : r)),
    }));
  }

  function patchGeometry(next: { waypoints?: Run["waypoints"]; paths?: Run["paths"]; robot?: Run["robot"] }) {
    updateRun((r) => ({ ...r, ...next }));
  }

  function addPlan() {
    if (!store) return;
    const plan = createPlan(`Plan ${store.plans.length + 1}`);
    updateStore((s) => ({ ...s, plans: [...s.plans, plan], activePlanId: plan.id }));
    setSelected(null);
  }

  function removePlan() {
    if (!store || store.plans.length <= 1) return;
    if (!confirm("Delete this plan and all of its runs?")) return;
    const remaining = store.plans.filter((p) => p.id !== store.activePlanId);
    updateStore((s) => ({ ...s, plans: remaining, activePlanId: remaining[0].id }));
    setSelected(null);
  }

  function addRun() {
    if (!store) return;
    const plan = activePlan(store);
    const planSettings = resolveSettings(plan);
    const run = createRun(`Run ${plan.runs.length + 1}`);
    run.robot = {
      ...run.robot,
      ...(planSettings.defaultRobotWidth !== null
        ? { width: planSettings.defaultRobotWidth }
        : {}),
      ...(planSettings.defaultRobotLength !== null
        ? { length: planSettings.defaultRobotLength }
        : {}),
    };
    updatePlan((p) => ({ ...p, runs: [...p.runs, run], activeRunId: run.id }));
    setSelected(null);
  }

  function removeRun() {
    if (!store) return;
    const plan = activePlan(store);
    if (plan.runs.length <= 1) return;
    if (!confirm("Delete this run?")) return;
    const remaining = plan.runs.filter((r) => r.id !== plan.activeRunId);
    updatePlan((p) => ({ ...p, runs: remaining, activeRunId: remaining[0].id }));
    setSelected(null);
  }

  function deleteSelected() {
    if (!selected) return;
    if (selected.type === "path") {
      patchGeometry({ paths: (activeRunSafe()?.paths || []).filter((p) => p.id !== selected.id) });
    } else if (selected.type === "waypoint") {
      patchGeometry({
        waypoints: (activeRunSafe()?.waypoints || []).filter((w) => w.id !== selected.id),
      });
    }
    setSelected(null);
  }

  function clearCanvas() {
    if (!confirm("Clear all waypoints and paths for this run?")) return;
    const plan = store ? activePlan(store) : null;
    const run = plan ? activeRun(plan) : null;
    if (!run) return;
    patchGeometry({ waypoints: [], paths: [], robot: { ...run.robot, angle: 0 } });
    setSelected(null);
    setDraft([]);
  }

  function activeRunSafe(): Run | null {
    if (!store) return null;
    return activeRun(activePlan(store));
  }

  function finishPath() {
    if (draft.length > 1) {
      patchGeometry({
        paths: [
          ...(activeRunSafe()?.paths || []),
          {
            id: Math.random().toString(36).slice(2, 10),
            points: draft,
            ...(lineColor ? { color: lineColor } : {}),
          },
        ],
      });
    }
    setDraft([]);
    setTool("select");
  }

  function applyLineColor(value: string) {
    setLineColor(value);
    if (selected?.type === "path") {
      const pathId = selected.id;
      updateRun((r) => ({
        ...r,
        paths: r.paths.map((p) =>
          p.id === pathId ? (value ? { ...p, color: value } : { ...p, color: undefined }) : p
        ),
      }));
    }
  }

  function renamePlan(planId: string, raw: string) {
    const name = raw.trim();
    if (name) {
      updateStore((s) => ({
        ...s,
        plans: s.plans.map((p) => (p.id === planId ? { ...p, name } : p)),
      }));
    }
    setRenameTarget(null);
  }

  function renameRun(planId: string, runId: string, raw: string) {
    const name = raw.trim();
    if (name) {
      updateStore((s) => ({
        ...s,
        plans: s.plans.map((p) =>
          p.id === planId
            ? { ...p, runs: p.runs.map((r) => (r.id === runId ? { ...r, name } : r)) }
            : p
        ),
      }));
    }
    setRenameTarget(null);
  }

  function setRobotDim(part: "width" | "length", raw: string) {
    const cm = parseFloat(raw);
    updateRun((r) => ({
      ...r,
      robot: {
        ...r.robot,
        [part]: Number.isFinite(cm) && cm > 0 ? Math.max(5, Math.round(cm * 5)) : undefined,
      },
    }));
  }

  function setRobotAngle(raw: string) {
    const deg = parseInt(raw, 10);
    updateRun((r) => ({
      ...r,
      robot: {
        ...r.robot,
        angle: Number.isFinite(deg) ? ((Math.round(deg) % 360) + 360) % 360 : 0,
      },
    }));
  }

  function resetRobotDim() {
    updateRun((r) => ({ ...r, robot: { ...r.robot, width: undefined, length: undefined } }));
  }

  function patchSettings(patch: Partial<PlanSettings>) {
    updatePlan((p) => {
      const settings: PlanSettings = { ...(p.settings ?? {}), ...patch };
      for (const key of Object.keys(patch) as (keyof PlanSettings)[]) {
        if (patch[key] === undefined) delete settings[key];
      }
      const next: Plan = { ...p, settings };
      if (Object.keys(settings).length === 0) delete next.settings;
      return next;
    });
  }

  function resetSettings() {
    updatePlan((p) => {
      const next: Plan = { ...p };
      delete next.settings;
      return next;
    });
    setSettingsEpoch((n) => n + 1);
  }

  function commitNumber(
    raw: string,
    min: number,
    max: number,
    apply: (value: number | undefined) => void
  ) {
    const value = parseInt(raw, 10);
    if (!Number.isFinite(value)) apply(undefined);
    else apply(Math.max(min, Math.min(max, value)));
  }

  if (!store) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-cyan-500" />
        <p className="text-sm text-foreground">Loading planner…</p>
      </div>
    );
  }

  const plan = activePlan(store);
  const run = activeRun(plan);
  const summary = totalForRun(missions, run.selections, run.checklist);
  const planSettings = resolveSettings(plan);
  const analysis = analysePlan(plan, missions);
  const robotDims = robotSize(run.robot, !!robotImageUrl, {
    width: planSettings.defaultRobotWidth,
    length: planSettings.defaultRobotLength,
  });
  const selectedWaypoint =
    selected?.type === "waypoint" ? run.waypoints.find((w) => w.id === selected.id) || null : null;
  const selectedPath =
    selected?.type === "path" ? run.paths.find((p) => p.id === selected.id) || null : null;
  const activeLineColor = selectedPath ? selectedPath.color || "" : lineColor;

  function changeTool(next: Tool) {
    setTool(next);
    setDraft([]);
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background lg:h-[100dvh] lg:overflow-hidden">
      <header className="z-30 border-b bg-background/90 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:px-4">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-medium text-foreground transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Site</span>
          </Link>

          <span className="text-sm font-bold tracking-tight">
            <span className="text-cyan-600 dark:text-cyan-400">Bio</span>
            <span className="text-emerald-600 dark:text-emerald-400">Glow</span>{" "}
            <span className="hidden sm:inline text-foreground font-medium">Planner</span>
          </span>

          <div className="flex items-center gap-1">
            <select
              value={plan.id}
              onChange={(e) => {
                updateStore((s) => ({ ...s, activePlanId: e.target.value }));
                setSelected(null);
              }}
              className="h-8 max-w-32 rounded-lg border border-input bg-background px-2 text-xs sm:max-w-44"
              aria-label="Select plan"
            >
              {store.plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button size="icon-xs" variant="ghost" aria-label="Add plan" onClick={addPlan}>
              <Plus />
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Delete plan"
              disabled={store.plans.length <= 1}
              onClick={removePlan}
            >
              <X />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <select
              value={run.id}
              onChange={(e) => {
                updatePlan((p) => ({ ...p, activeRunId: e.target.value }));
                setSelected(null);
              }}
              className="h-8 max-w-28 rounded-lg border border-input bg-background px-2 text-xs sm:max-w-36"
              aria-label="Select run"
            >
              {plan.runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <Button size="icon-xs" variant="ghost" aria-label="Add run" onClick={addRun}>
              <Plus />
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Delete run"
              disabled={plan.runs.length <= 1}
              onClick={removeRun}
            >
              <X />
            </Button>
          </div>

          <span
            className={cn(
              "rounded-lg px-2 py-1 font-mono text-sm font-bold tabular-nums",
              summary.total > 0
                ? "bg-emerald-600 text-white"
                : "bg-muted text-foreground"
            )}
            title="Current run score"
          >
            {summary.total > 0 && summary.variableMissions > 0 ? "≥" : ""}
            {summary.total}
            <span className="text-[10px] font-medium opacity-80"> pts</span>
          </span>

          <div className="ml-auto flex items-center gap-2">
            <span
              className="hidden text-[11px] text-foreground sm:inline"
              title="Auto save is off. Your runs stay on this device until you download them from Downloads."
            >
              Auto save off
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              title="Analyse my plan"
              onClick={() => setShowAnalysis(true)}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Analyse my plan</span>
              <span className="sm:hidden">Analyse</span>
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="How to use the planner"
              title="How to use the planner"
              onClick={() => setShowInfo(true)}
            >
              <Info />
            </Button>
            <Timer
              remaining={timerRemaining}
              running={timerRunning}
              onRunningChange={setTimerRunning}
              onReset={resetTimer}
            />
            <Link href="/planner/downloads" title="Download and upload runs">
              <Button size="icon-xs" variant="ghost" aria-label="Downloads">
                <Download />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="flex min-h-0 flex-col gap-2 p-3">
          <div className="flex flex-wrap items-center gap-1">
            {TOOLS.map((t) => (
              <Button
                key={t.id}
                size="icon-sm"
                variant={tool === t.id ? "default" : "ghost"}
                aria-label={t.label}
                title={t.label}
                onClick={() => changeTool(t.id)}
              >
                <t.icon />
              </Button>
            ))}

            <span className="mx-1 h-5 w-px bg-border" />

            <div className="flex items-center gap-1" title="Line color for movement lines">
              {LINE_COLORS.map((c) => (
                <button
                  key={c.value || "default"}
                  type="button"
                  aria-label={`Line color ${c.label}`}
                  title={c.label}
                  onClick={() => applyLineColor(c.value)}
                  className={`h-4 w-4 rounded-full border-2 transition-transform hover:scale-110 ${
                    activeLineColor === c.value ? "border-foreground" : "border-border"
                  }`}
                  style={{ backgroundColor: c.swatch }}
                />
              ))}
            </div>

            <span className="mx-1 h-5 w-px bg-border" />

            {selectedWaypoint && (
              <Input
                key={selectedWaypoint.id}
                defaultValue={selectedWaypoint.label}
                onChange={(e) => {
                  const value = e.target.value;
                  updateRun((r) => ({
                    ...r,
                    waypoints: r.waypoints.map((w) =>
                      w.id === selectedWaypoint.id ? { ...w, label: value } : w
                    ),
                  }));
                }}
                placeholder="Waypoint label"
                className="h-7 w-36 text-xs"
              />
            )}

            {selected?.type === "robot" && (
              <div
                className="flex items-center gap-2 rounded-lg border bg-muted/40 px-2 py-1"
                title="Robot size and heading"
              >
                <span className="text-[10px] font-semibold text-foreground">Robot</span>
                <label className="flex items-center gap-1 text-[10px] text-foreground">
                  Width
                  <Input
                    type="number"
                    min={1}
                    value={Math.round(robotDims.width / 5)}
                    onChange={(e) => setRobotDim("width", e.target.value)}
                    className="h-7 w-16 text-xs"
                    aria-label="Robot width in centimetres"
                  />
                </label>
                <label className="flex items-center gap-1 text-[10px] text-foreground">
                  Length
                  <Input
                    type="number"
                    min={1}
                    value={Math.round(robotDims.length / 5)}
                    onChange={(e) => setRobotDim("length", e.target.value)}
                    className="h-7 w-16 text-xs"
                    aria-label="Robot length in centimetres"
                  />
                </label>
                <label className="flex items-center gap-1 text-[10px] text-foreground">
                  Angle
                  <Input
                    type="number"
                    value={run.robot.angle}
                    onChange={(e) => setRobotAngle(e.target.value)}
                    className="h-7 w-16 text-xs"
                    aria-label="Robot angle in degrees"
                  />
                </label>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Reset robot size to plan default"
                  title="Reset robot size to plan default"
                  onClick={resetRobotDim}
                >
                  <RotateCcw />
                </Button>
              </div>
            )}

            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Delete selected item"
              title="Delete selected item"
              disabled={!selected || selected.type === "robot"}
              onClick={deleteSelected}
            >
              <Trash2 />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Clear canvas"
              title="Clear canvas"
              onClick={clearCanvas}
            >
              <Ban />
            </Button>

            {draft.length > 1 && (
              <>
                <Button size="sm" variant="default" className="h-7 text-xs" onClick={finishPath}>
                  <Route className="h-3.5 w-3.5" />
                  Finish path
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setDraft([])}>
                  Cancel
                </Button>
              </>
            )}

            <span className="ml-auto hidden text-[11px] text-foreground sm:block">
              {tool === "waypoint"
                ? "Tap the mat to drop a waypoint"
                : tool === "path"
                  ? "Tap the mat to add points, then finish"
                  : tool === "robot"
                    ? "Tap the mat to place the robot"
                    : tool === "erase"
                      ? "Tap a waypoint or path to remove it"
                      : "Drag the robot or waypoints to move them"}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-x-auto">
            <div className="min-w-[560px]">
              <MatCanvas
                key={`${run.id}:${simEpoch}`}
                matImageUrl={config.matImageUrl}
                tool={tool}
                waypoints={run.waypoints}
                paths={run.paths}
                robot={run.robot}
                selected={selected}
                draft={draft}
                simRunning={timerRunning}
                simDurationMs={(TIMER_SECONDS * 1000 * 100) / planSettings.robotSpeedPercent}
                robotImageUrl={robotImageUrl}
                robotImageRotation={robotImageRotation}
                showHeading={planSettings.showHeading}
                robotDefaults={{
                  width: planSettings.defaultRobotWidth,
                  length: planSettings.defaultRobotLength,
                }}
                onChange={patchGeometry}
                onDraftChange={setDraft}
                onSelect={setSelected}
                onPathFinish={finishPath}
                onToolDone={() => {
                  setTool("select");
                  setDraft([]);
                }}
              />
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col gap-3 border-t bg-muted/20 p-3 lg:border-t-0 lg:border-l">
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between text-xs text-foreground">
              <span>Missions</span>
              <span className="font-mono font-semibold">{summary.missionPoints}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-foreground">
              <span>Precision tokens</span>
              <span className="font-mono font-semibold">{summary.precision}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-foreground">
              <span>Equipment inspection</span>
              <span className="font-mono font-semibold">{summary.equipment}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm font-bold">
              <span>Run total</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                {summary.total > 0 && summary.variableMissions > 0 ? "≥" : ""}
                {summary.total} pts
              </span>
            </div>
            {summary.variableMissions > 0 && (
              <p className="mt-1 text-[10px] leading-snug text-foreground">
                {summary.variableMissions} mission
                {summary.variableMissions === 1 ? "" : "s"} in this run score by count, so the real
                total can be higher.
              </p>
            )}
          </div>

          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as TabValue)}
            className="min-h-0 flex-1 flex-col"
          >
            <TabsList className="w-full">
              <TabsTrigger value="missions">
                <Flag className="h-3.5 w-3.5" />
                Missions
              </TabsTrigger>
              <TabsTrigger value="checklist">
                <ListChecks className="h-3.5 w-3.5" />
                Checklist
              </TabsTrigger>
              <TabsTrigger value="notes">
                <StickyNote className="h-3.5 w-3.5" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="runs">
                <Layers className="h-3.5 w-3.5" />
                Runs
              </TabsTrigger>
              <TabsTrigger value="settings" aria-label="Settings" title="Settings">
                <Settings className="h-3.5 w-3.5" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="missions" className="min-h-0 flex-1 overflow-y-auto pr-1">
              <MissionsPanel
                missions={missions}
                selections={run.selections}
                onMissionChange={(missionId, next) =>
                  updateRun((r) => ({ ...r, selections: { ...r.selections, [missionId]: next } }))
                }
                onResetAll={() => updateRun((r) => ({ ...r, selections: {} }))}
              />
            </TabsContent>

            <TabsContent value="checklist" className="min-h-0 flex-1 overflow-y-auto pr-1">
              <ChecklistPanel
                checklist={run.checklist}
                checklistItems={config.checklistItems}
                onChange={(checklist) => updateRun((r) => ({ ...r, checklist }))}
              />
            </TabsContent>

            <TabsContent value="notes" className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-xs text-foreground">Plan name</label>
                  <Input
                    value={plan.name}
                    onChange={(e) => updatePlan((p) => ({ ...p, name: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-foreground">Run name</label>
                  <Input
                    value={run.name}
                    onChange={(e) => updatePlan((p) => ({ ...p, runs: p.runs.map((r) => (r.id === p.activeRunId ? { ...r, name: e.target.value } : r)) }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-foreground">
                    Attachment for this run
                  </label>
                  <Input
                    value={run.attachment ?? ""}
                    onChange={(e) =>
                      updateRun((r) => ({ ...r, attachment: e.target.value || undefined }))
                    }
                    placeholder="For example, claw, gripper, launcher"
                    className="mb-2 h-8 text-sm"
                  />
                  <AttachmentUpload
                    value={run.attachmentImage}
                    onChange={(url) =>
                      updateRun((r) => ({ ...r, attachmentImage: url }))
                    }
                  />
                  <p className="mt-1.5 text-[11px] leading-snug text-foreground">
                    The photo belongs to this run only. Every run can have its own attachment
                    picture.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-foreground">
                    Notes for this plan
                  </label>
                  <Textarea
                    value={plan.notes}
                    onChange={(e) => updatePlan((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Attachment changes, timing tips, what to fix before the next run…"
                    rows={8}
                    className="resize-none text-sm"
                  />
                </div>
                <p className="text-[11px] leading-snug text-foreground">
                  Auto save is off, so download your runs from Downloads to keep them, and upload
                  the file there to get them back. This run holds its own waypoints, paths,
                  scoring, and checklist.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="runs" className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col gap-2">
                <p className="text-[11px] leading-snug text-foreground">
                  Every run from every plan in one list. Click a run to open it, and use the
                  pencil to rename plans and runs.
                </p>
                {store.plans.map((p) => {
                  const editingPlan =
                    renameTarget?.type === "plan" && renameTarget.planId === p.id;
                  return (
                    <div key={p.id} className="overflow-hidden rounded-lg border">
                      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-2.5 py-1.5">
                        {editingPlan ? (
                          <Input
                            autoFocus
                            defaultValue={p.name}
                            onFocus={(e) => e.currentTarget.select()}
                            onBlur={(e) => {
                              if (renameCancelledRef.current) {
                                renameCancelledRef.current = false;
                                return;
                              }
                              renamePlan(p.id, e.currentTarget.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") renamePlan(p.id, e.currentTarget.value);
                              else if (e.key === "Escape") {
                                renameCancelledRef.current = true;
                                setRenameTarget(null);
                              }
                            }}
                            className="h-6 flex-1 border-cyan-600 bg-background text-xs"
                          />
                        ) : (
                          <span className="min-w-0 text-xs font-semibold">{p.name}</span>
                        )}
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="text-[10px] text-foreground">
                            {p.runs.length} {p.runs.length === 1 ? "run" : "runs"}
                          </span>
                          {!editingPlan && (
                            <button
                              type="button"
                              aria-label={`Rename ${p.name}`}
                              title="Rename plan"
                              onClick={() => setRenameTarget({ type: "plan", planId: p.id })}
                              className="rounded p-1 text-foreground transition-colors hover:text-foreground"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="p-1">
                        {p.runs.map((r) => {
                          const rs = totalForRun(missions, r.selections, r.checklist);
                          const isActive =
                            p.id === store.activePlanId && r.id === plan.activeRunId;
                          const editingRun =
                            renameTarget?.type === "run" && renameTarget.runId === r.id;
                          return (
                            <div
                              key={r.id}
                              className={`flex items-center gap-1 rounded-md transition-colors ${
                                isActive ? "bg-cyan-600 text-white" : "hover:bg-muted/60"
                              }`}
                            >
                              {editingRun ? (
                                <Input
                                  autoFocus
                                  defaultValue={r.name}
                                  onFocus={(e) => e.currentTarget.select()}
                                  onBlur={(e) => {
                                    if (renameCancelledRef.current) {
                                      renameCancelledRef.current = false;
                                      return;
                                    }
                                    renameRun(p.id, r.id, e.currentTarget.value);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      renameRun(p.id, r.id, e.currentTarget.value);
                                    else if (e.key === "Escape") {
                                      renameCancelledRef.current = true;
                                      setRenameTarget(null);
                                    }
                                  }}
                                  className="h-7 flex-1 border-cyan-600 bg-background text-xs text-foreground"
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateStore((s) => ({
                                      ...s,
                                      activePlanId: p.id,
                                      plans: s.plans.map((pl) =>
                                        pl.id === p.id ? { ...pl, activeRunId: r.id } : pl
                                      ),
                                    }));
                                    setSelected(null);
                                    setDraft([]);
                                  }}
                                  className="flex min-w-0 flex-1 items-center justify-between gap-2 px-2 py-1.5 text-left text-sm"
                                >
                                  <span className="min-w-0">{r.name}</span>
                                  <span className="font-mono text-xs font-bold tabular-nums">
                                    {rs.variableMissions > 0 && rs.total > 0 ? "≥" : ""}
                                    {rs.total}
                                  </span>
                                </button>
                              )}
                              {!editingRun && (
                                <button
                                  type="button"
                                  aria-label={`Rename ${r.name}`}
                                  title="Rename run"
                                  onClick={() =>
                                    setRenameTarget({ type: "run", planId: p.id, runId: r.id })
                                  }
                                  className={`shrink-0 rounded p-1 transition-colors ${
                                    isActive
                                      ? "text-white"
                                      : "text-foreground hover:text-cyan-600 dark:hover:text-cyan-400"
                                  }`}
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

          <TabsContent value="settings" className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div key={settingsEpoch} className="flex flex-col gap-3">
              <p className="text-[11px] leading-snug text-foreground">
                These settings apply to this plan only. The analysis uses them for match time,
                reliability, launches, attachment changes and plan health.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-foreground">
                    Match duration (seconds)
                  </label>
                  <Input
                    type="number"
                    min={30}
                    max={900}
                    defaultValue={planSettings.matchDurationSeconds}
                    onBlur={(e) =>
                      commitNumber(e.currentTarget.value, 30, 900, (v) =>
                        patchSettings({ matchDurationSeconds: v })
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-foreground">
                    Reliability threshold (%)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={planSettings.reliabilityThreshold}
                    onBlur={(e) =>
                      commitNumber(e.currentTarget.value, 0, 100, (v) =>
                        patchSettings({ reliabilityThreshold: v })
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-foreground">
                    Maximum launches
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    defaultValue={planSettings.maxLaunches}
                    onBlur={(e) =>
                      commitNumber(e.currentTarget.value, 1, 60, (v) =>
                        patchSettings({ maxLaunches: v })
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-foreground">
                    Maximum attachment changes
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    defaultValue={planSettings.maxAttachmentChanges}
                    onBlur={(e) =>
                      commitNumber(e.currentTarget.value, 0, 60, (v) =>
                        patchSettings({ maxAttachmentChanges: v })
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-foreground">
                    Robot speed (% of real time)
                  </label>
                  <Input
                    type="number"
                    min={25}
                    max={400}
                    defaultValue={planSettings.robotSpeedPercent}
                    onBlur={(e) =>
                      commitNumber(e.currentTarget.value, 25, 400, (v) =>
                        patchSettings({ robotSpeedPercent: v })
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-foreground">
                    Default robot width (cm)
                  </label>
                  <Input
                    type="number"
                    min={4}
                    max={80}
                    placeholder="Classic size"
                    defaultValue={
                      planSettings.defaultRobotWidth !== null
                        ? Math.round(planSettings.defaultRobotWidth / 5)
                        : ""
                    }
                    onBlur={(e) => {
                      const cm = parseFloat(e.currentTarget.value);
                      patchSettings({
                        defaultRobotWidth:
                          Number.isFinite(cm) && cm > 0
                            ? Math.max(20, Math.min(400, Math.round(cm * 5)))
                            : undefined,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-foreground">
                    Default robot length (cm)
                  </label>
                  <Input
                    type="number"
                    min={4}
                    max={80}
                    placeholder="Classic size"
                    defaultValue={
                      planSettings.defaultRobotLength !== null
                        ? Math.round(planSettings.defaultRobotLength / 5)
                        : ""
                    }
                    onBlur={(e) => {
                      const cm = parseFloat(e.currentTarget.value);
                      patchSettings({
                        defaultRobotLength:
                          Number.isFinite(cm) && cm > 0
                            ? Math.max(20, Math.min(400, Math.round(cm * 5)))
                            : undefined,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-foreground">Distance units</label>
                <select
                  value={planSettings.units}
                  onChange={(e) =>
                    patchSettings({ units: e.target.value === "cm" ? "cm" : "m" })
                  }
                  className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
                >
                  <option value="m">Metres</option>
                  <option value="cm">Centimetres</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={planSettings.showHeading}
                    onChange={(e) => patchSettings({ showHeading: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  Show heading arrow on the mat
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={planSettings.planHealthEnabled}
                    onChange={(e) => patchSettings({ planHealthEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  Include plan health score in analysis
                </label>
              </div>

              <Button size="sm" variant="outline" className="gap-1.5 self-start text-xs" onClick={resetSettings}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset plan settings
              </Button>

              <p className="text-[11px] leading-snug text-foreground">
                New launches pick up the default robot size. The timer widget always uses 2:30 and
                the plan duration only affects the analysis. Robot speed only changes how fast the
                robot moves along the drawn line while the timer runs.
              </p>
            </div>
          </TabsContent>
          </Tabs>
        </aside>
      </div>

      {showAnalysis && (
        <AnalysisModal
          analysis={analysis}
          plan={plan}
          missions={missions}
          onUpdatePlan={updatePlan}
          onShowRun={(runId) => {
            updatePlan((p) => ({ ...p, activeRunId: runId }));
            const target = plan.runs.find((r) => r.id === runId);
            setSelected(target?.paths[0] ? { type: "path", id: target.paths[0].id } : null);
            setDraft([]);
            setTool("select");
            setShowAnalysis(false);
          }}
          onClose={() => setShowAnalysis(false)}
        />
      )}

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}
