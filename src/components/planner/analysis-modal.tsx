"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  Eye,
  Lightbulb,
  Plus,
  TriangleAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AttachmentUpload } from "@/components/planner/attachment-upload";
import { cn } from "@/lib/utils";
import {
  distanceLabel,
  formatClock,
  type PlanAnalysis,
} from "@/lib/planner/analysis";
import type { Mission, Plan, RiskLevel, Run } from "@/lib/planner/types";

interface AnalysisModalProps {
  analysis: PlanAnalysis;
  plan: Plan;
  missions: Mission[];
  onUpdatePlan: (fn: (plan: Plan) => Plan) => void;
  onShowRun: (runId: string) => void;
  onClose: () => void;
}

type SortKey = "code" | "pct" | "risk" | "attempts";

const RISK_ORDER: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };

function compareNullable(
  a: string | number | null,
  b: string | number | null,
  dir: "asc" | "desc"
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "string" && typeof b === "string") {
    return dir === "asc" ? a.localeCompare(b) : b.localeCompare(a);
  }
  const av = Number(a);
  const bv = Number(b);
  return dir === "asc" ? av - bv : bv - av;
}

function SortHead({
  label,
  k,
  sort,
  onSort,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (key: SortKey) => void;
}) {
  const Icon = sort.key !== k ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSort(k)}
      className="flex items-center gap-1 text-left transition-colors hover:text-foreground"
    >
      {label}
      <Icon className="h-3 w-3 opacity-60" />
    </button>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "warn";
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-[11px] text-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 font-mono text-lg font-bold tabular-nums",
          tone === "good" && "text-emerald-600 dark:text-emerald-400",
          tone === "warn" && "text-amber-600 dark:text-amber-400"
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[10px] leading-snug text-foreground">{hint}</p>}
    </div>
  );
}

export function AnalysisModal({
  analysis,
  plan,
  missions,
  onUpdatePlan,
  onShowRun,
  onClose,
}: AnalysisModalProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "pct",
    dir: "asc",
  });
  const [addMission, setAddMission] = useState("");
  const [addAttempts, setAddAttempts] = useState("");
  const [addSuccesses, setAddSuccesses] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const settings = analysis.settings;

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  function setRisk(missionId: string, raw: string) {
    onUpdatePlan((p) => {
      const risk = { ...(p.risk ?? {}) };
      if (raw === "low" || raw === "medium" || raw === "high") risk[missionId] = raw;
      else delete risk[missionId];
      const next: Plan = { ...p, risk };
      if (Object.keys(risk).length === 0) delete next.risk;
      return next;
    });
  }

  function updatePractice(missionId: string, attempts: number, successes: number) {
    const att = Math.max(0, Math.min(999, Math.round(attempts)));
    const suc = Math.max(0, Math.min(att, Math.round(successes)));
    onUpdatePlan((p) => {
      const practice = { ...(p.practice ?? {}) };
      if (att <= 0 && suc <= 0) delete practice[missionId];
      else practice[missionId] = { attempts: att, successes: suc };
      const next: Plan = { ...p, practice };
      if (Object.keys(practice).length === 0) delete next.practice;
      return next;
    });
  }

  function addPractice() {
    const mission = missions.find((m) => m.id === addMission);
    if (!mission) return;
    const attempts = parseInt(addAttempts, 10);
    if (!Number.isFinite(attempts) || attempts < 1) return;
    const successes = parseInt(addSuccesses, 10) || 0;
    updatePractice(mission.id, attempts, successes);
    setAddMission("");
    setAddAttempts("");
    setAddSuccesses("");
  }

  function updateLaunch(
    runId: string,
    patch: Partial<Pick<Run, "attachment" | "attachmentImage" | "estimatedSeconds" | "returnsToBase">>
  ) {
    onUpdatePlan((p) => ({
      ...p,
      runs: p.runs.map((r) => (r.id === runId ? { ...r, ...patch } : r)),
    }));
  }

  const rows = missions
    .filter((m) => plan.practice?.[m.id] || plan.risk?.[m.id])
    .map((m) => {
      const stat = plan.practice?.[m.id];
      const risk = plan.risk?.[m.id] ?? null;
      const pct =
        stat && stat.attempts > 0 ? Math.round((stat.successes / stat.attempts) * 100) : null;
      return {
        id: m.id,
        code: m.code,
        name: m.name,
        attempts: stat?.attempts ?? null,
        successes: stat?.successes ?? null,
        pct,
        risk,
      };
    });

  const sortedRows = [...rows].sort((a, b) => {
    if (sort.key === "code") return compareNullable(a.code, b.code, sort.dir);
    if (sort.key === "pct") return compareNullable(a.pct, b.pct, sort.dir);
    if (sort.key === "attempts") return compareNullable(a.attempts, b.attempts, sort.dir);
    return compareNullable(
      a.risk === null ? null : RISK_ORDER[a.risk],
      b.risk === null ? null : RISK_ORDER[b.risk],
      sort.dir
    );
  });

  const health = analysis.health;
  const verdictTone =
    analysis.warnings.length > 0
      ? "border-amber-500/50 bg-amber-50 text-amber-800 dark:text-amber-300"
      : analysis.score.total === 0
        ? "border-border bg-muted/40 text-foreground"
        : "border-emerald-500/50 bg-emerald-50 text-emerald-800 dark:text-emerald-300";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Plan analysis"
    >
      <div className="my-auto flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur">
          <BarChart3 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold">Plan analysis</h2>
            <p className="truncate text-[11px] text-foreground">{plan.name}</p>
          </div>
          <Button
            size="icon-xs"
            variant="ghost"
            className="ml-auto"
            aria-label="Close analysis"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div className={cn("rounded-lg border p-3 text-sm font-medium", verdictTone)}>
            {analysis.overall}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-foreground">
                  Total score
                </p>
                <p className="font-mono text-3xl font-bold leading-none">
                  {analysis.score.variableMissions > 0 && analysis.score.total > 0 ? "≥" : ""}
                  {analysis.score.total}
                  <span className="text-base"> pts</span>
                </p>
              </div>
              <div className="text-xs leading-relaxed text-foreground">
                <p>
                  {analysis.score.missionPoints} mission + {analysis.score.precision} precision +{" "}
                  {analysis.score.equipment} equipment
                </p>
                <p>
                  {analysis.score.missions.length}{" "}
                  {analysis.score.missions.length === 1 ? "mission" : "missions"} doing
                  {analysis.score.variableMissions > 0
                    ? ` · ${analysis.score.variableMissions} variable`
                    : ""}
                </p>
              </div>
            </div>

            {analysis.score.missions.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <p className="mb-2 text-xs font-bold">Missions you are doing</p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {analysis.score.missions.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-xs"
                    >
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {m.code}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-foreground">{m.name}</span>
                      <span className="whitespace-nowrap font-mono font-semibold text-foreground">
                        {m.variable ? "≥" : ""}
                        {m.points} pts
                      </span>
                      <span className="whitespace-nowrap text-foreground">
                        · {m.launches} {m.launches === 1 ? "launch" : "launches"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label="Launches"
              value={String(analysis.totalLaunches)}
              hint={`Preferred maximum ${settings.maxLaunches}`}
              tone={
                analysis.totalLaunches > settings.maxLaunches ? "warn" : undefined
              }
            />
            <Stat
              label="Missions scored"
              value={String(analysis.distinctMissions)}
              hint={`${analysis.missionAssignments} assignments across every launch`}
            />
            <Stat
              label="Average missions per launch"
              value={analysis.avgMissionsPerLaunch.toFixed(1)}
              hint="Based on missions with points in each launch"
            />
            <Stat
              label="Attachment changes"
              value={analysis.attachmentKnown ? String(analysis.attachmentChanges) : "Not entered"}
              hint={
                analysis.attachmentKnown
                  ? `Preferred maximum ${settings.maxAttachmentChanges}`
                  : "Add an attachment per launch below"
              }
              tone={
                analysis.attachmentKnown &&
                analysis.attachmentChanges !== null &&
                analysis.attachmentChanges > settings.maxAttachmentChanges
                  ? "warn"
                  : undefined
              }
            />
            <Stat
              label="Returns to base"
              value={
                analysis.returnsKnown
                  ? `${analysis.returnsToBase} of ${analysis.totalLaunches}`
                  : "Not entered"
              }
              hint="Launches planned to finish back at base"
            />
            <Stat
              label="Estimated plan time"
              value={
                analysis.time.known
                  ? `${formatClock(analysis.time.totalSeconds)} of ${formatClock(settings.matchDurationSeconds)}`
                  : "Not entered"
              }
              hint={
                analysis.time.known
                  ? analysis.time.overBy !== null
                    ? `Over by ${analysis.time.overBy} seconds`
                    : `Buffer of ${analysis.time.bufferSeconds} seconds`
                  : "Add an estimated time per launch below"
              }
              tone={
                analysis.time.known ? (analysis.time.overBy !== null ? "warn" : "good") : undefined
              }
            />
            <Stat
              label="Projected score"
              value={`${analysis.score.variableMissions > 0 && analysis.score.total > 0 ? "≥" : ""}${analysis.score.total} pts`}
              hint={`${analysis.score.missionPoints} mission + ${analysis.score.precision} precision + ${analysis.score.equipment} equipment`}
            />
            <Stat
              label="Overall reliability"
              value={analysis.reliability.known ? `${analysis.reliability.overallPct}%` : "Not logged"}
              hint={
                analysis.reliability.known
                  ? `${analysis.reliability.belowCount} below ${settings.reliabilityThreshold}%`
                  : "Log attempts in the table below"
              }
              tone={
                analysis.reliability.known
                  ? analysis.reliability.belowCount > 0
                    ? "warn"
                    : "good"
                  : undefined
              }
            />
            <Stat
              label="Risk profile"
              value={
                analysis.risk.known
                  ? `L ${analysis.risk.low} · M ${analysis.risk.medium} · H ${analysis.risk.high}`
                  : "Not rated"
              }
              hint={
                analysis.risk.known
                  ? `${analysis.risk.unratedMissions} missions without a rating`
                  : "Rate missions in the table below"
              }
            />
          </div>

          {health.enabled && health.score !== null && (
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">Plan health</p>
                  <p className="text-[11px] text-foreground">
                    Planner generated indicator based on the data entered in this plan
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-36 overflow-hidden rounded-full bg-muted sm:w-48">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        health.score >= 75
                          ? "bg-emerald-500"
                          : health.score >= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      )}
                      style={{ width: `${health.score}%` }}
                    />
                  </div>
                  <span className="font-mono text-xl font-bold tabular-nums">{health.score}</span>
                </div>
              </div>
              {health.explanation && (
                <p className="mt-2 text-[11px] leading-snug text-foreground">
                  {health.explanation}
                </p>
              )}
            </div>
          )}

          {(analysis.warnings.length > 0 || analysis.suggestions.length > 0) && (
            <div className="grid gap-2 sm:grid-cols-2">
              {analysis.warnings.length > 0 && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-50/60 p-3 dark:bg-amber-950/30">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <TriangleAlert className="h-3.5 w-3.5" />
                    Warnings
                  </p>
                  <ul className="space-y-1.5">
                    {analysis.warnings.map((w, i) => (
                      <li
                        key={i}
                        className="text-[11px] leading-snug text-amber-800 dark:text-amber-200"
                      >
                        {w.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.suggestions.length > 0 && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-50/60 p-3 dark:bg-emerald-950/30">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Suggestions
                  </p>
                  <ul className="space-y-1.5">
                    {analysis.suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="text-[11px] leading-snug text-emerald-800 dark:text-emerald-200"
                      >
                        {s.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border bg-card">
            <div className="border-b px-3 py-2">
              <p className="text-sm font-bold">Reliability and risk</p>
              <p className="text-[11px] text-foreground">
                Sort any column, edit attempts and success values, and set a risk level per mission.
              </p>
            </div>
            {sortedRows.length === 0 ? (
              <p className="p-3 text-xs text-foreground">
                No practice attempts or risk ratings yet. Add your first entry below to fill this
                table.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead className="border-b bg-muted/40 text-[11px] text-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">
                        <SortHead label="Mission" k="code" sort={sort} onSort={toggleSort} />
                      </th>
                      <th className="px-3 py-2 font-medium">
                        <SortHead label="Reliability" k="pct" sort={sort} onSort={toggleSort} />
                      </th>
                      <th className="px-3 py-2 font-medium">
                        <SortHead label="Risk" k="risk" sort={sort} onSort={toggleSort} />
                      </th>
                      <th className="px-3 py-2 font-medium">
                        <SortHead label="Attempts" k="attempts" sort={sort} onSort={toggleSort} />
                      </th>
                      <th className="px-3 py-2 font-medium">Successes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((row) => (
                      <tr key={row.id} className="border-b last:border-b-0">
                        <td className="px-3 py-2">
                          <span className="font-mono font-semibold">{row.code}</span>{" "}
                          <span className="text-foreground">{row.name}</span>
                        </td>
                        <td className="px-3 py-2 font-mono font-semibold tabular-nums">
                          {row.pct === null ? (
                            <span className="font-sans font-normal text-foreground">
                              Not logged
                            </span>
                          ) : (
                            <span
                              className={
                                row.pct < settings.reliabilityThreshold
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }
                            >
                              {row.pct}%
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={row.risk ?? ""}
                            onChange={(e) => setRisk(row.id, e.target.value)}
                            aria-label={`Risk level for ${row.code}`}
                            className={cn(
                              "h-7 rounded-md border bg-background px-1.5 text-xs",
                              row.risk === "high" && "border-rose-400 font-medium text-rose-600",
                              row.risk === "medium" &&
                                "border-amber-400 font-medium text-amber-600",
                              row.risk === "low" &&
                                "border-emerald-400 font-medium text-emerald-600"
                            )}
                          >
                            <option value="">Not set</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            max={999}
                            title="Attempts"
                            aria-label={`Attempts for ${row.code}`}
                            defaultValue={row.attempts ?? ""}
                            onBlur={(e) =>
                              updatePractice(
                                row.id,
                                parseInt(e.currentTarget.value, 10) || 0,
                                row.successes ?? 0
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                updatePractice(
                                  row.id,
                                  parseInt(e.currentTarget.value, 10) || 0,
                                  row.successes ?? 0
                                );
                            }}
                            className="h-7 w-16 rounded-md border bg-background px-2 font-mono text-xs tabular-nums"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            max={999}
                            title="Successes"
                            aria-label={`Successes for ${row.code}`}
                            defaultValue={row.successes ?? ""}
                            onBlur={(e) =>
                              updatePractice(
                                row.id,
                                row.attempts ?? 0,
                                parseInt(e.currentTarget.value, 10) || 0
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                updatePractice(
                                  row.id,
                                  row.attempts ?? 0,
                                  parseInt(e.currentTarget.value, 10) || 0
                                );
                            }}
                            className="h-7 w-16 rounded-md border bg-background px-2 font-mono text-xs tabular-nums"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex flex-wrap items-end gap-2 border-t bg-muted/30 p-3">
              <div>
                <label className="mb-1 block text-[10px] text-foreground">Mission</label>
                <select
                  value={addMission}
                  onChange={(e) => setAddMission(e.target.value)}
                  className="h-8 max-w-52 rounded-lg border border-input bg-background px-2 text-xs"
                >
                  <option value="">Choose a mission</option>
                  {missions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-foreground">Attempts</label>
                <input
                  type="number"
                  min={1}
                  value={addAttempts}
                  onChange={(e) => setAddAttempts(e.target.value)}
                  className="h-8 w-20 rounded-lg border border-input bg-background px-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-foreground">Successes</label>
                <input
                  type="number"
                  min={0}
                  value={addSuccesses}
                  onChange={(e) => setAddSuccesses(e.target.value)}
                  className="h-8 w-20 rounded-lg border border-input bg-background px-2 text-xs font-mono"
                />
              </div>
              <Button
                size="sm"
                className="h-8 gap-1 text-xs"
                disabled={!addMission || parseInt(addAttempts, 10) < 1}
                onClick={addPractice}
              >
                <Plus className="h-3.5 w-3.5" />
                Add practice log
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-sm font-bold">Launch breakdown</p>
              <p className="text-[11px] text-foreground">
                Edit attachment, estimated time and returns for each launch. Use the eye button to
                show a launch on the mat.
              </p>
            </div>
            {analysis.launches.map((launch) => (
              <div key={launch.runId} className="rounded-lg border bg-card p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-cyan-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Launch {launch.index + 1}
                  </span>
                  <span className="text-sm font-semibold">{launch.name}</span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {launch.score.variableMissions > 0 && launch.score.total > 0 ? "≥" : ""}
                    {launch.score.total} pts
                  </span>
                  <span className="text-[10px] text-foreground">
                    {distanceLabel(launch.distanceUnits, settings.units)}
                  </span>
                  <span className="text-[10px] text-foreground">
                    Start {launch.start.x}, {launch.start.y} · {launch.start.angle}°
                  </span>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="ml-auto"
                    aria-label={`Show ${launch.name} on mat`}
                    title="Show on mat"
                    onClick={() => onShowRun(launch.runId)}
                  >
                    <Eye />
                  </Button>
                </div>
                {launch.missionCount > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {launch.missions.map((m) => (
                      <span
                        key={m.id}
                        className="rounded-md border bg-muted/40 px-1.5 py-0.5 text-[10px]"
                      >
                        <span className="font-mono font-semibold">{m.code}</span>{" "}
                        <span className="text-foreground">{m.name}</span>{" "}
                        <span className="font-mono font-semibold">{m.points}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    No missions scored in this launch
                  </p>
                )}
                <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[10px] text-foreground">
                      Attachment
                    </label>
                    <Input
                      value={launch.attachment}
                      placeholder="For example, claw"
                      onChange={(e) => updateLaunch(launch.runId, { attachment: e.target.value })}
                      onBlur={(e) => {
                        if (!e.target.value.trim())
                          updateLaunch(launch.runId, { attachment: undefined });
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-foreground">
                      Estimated seconds
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={900}
                      defaultValue={launch.estimatedSeconds ?? ""}
                      placeholder="For example, 20"
                      onBlur={(e) => {
                        const value = parseInt(e.currentTarget.value, 10);
                        updateLaunch(launch.runId, {
                          estimatedSeconds:
                            Number.isFinite(value) && value > 0 ? value : undefined,
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                      }}
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-foreground">
                      Returns to base
                    </label>
                    <select
                      value={
                        launch.returnsToBase === null || launch.returnsToBase === undefined
                          ? ""
                          : launch.returnsToBase
                            ? "yes"
                            : "no"
                      }
                      onChange={(e) =>
                        updateLaunch(launch.runId, {
                          returnsToBase:
                            e.target.value === "" ? undefined : e.target.value === "yes",
                        })
                      }
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="">Not set</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div className="mt-2.5">
                  <label className="mb-1 block text-[10px] text-foreground">
                    Attachment photo
                  </label>
                  <AttachmentUpload
                    compact
                    value={launch.attachmentImage || undefined}
                    onChange={(url) => updateLaunch(launch.runId, { attachmentImage: url })}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] leading-snug text-foreground">
            This analysis uses the missions, notes, launch data, practice logs and settings stored
            in this plan. It is a planning aid, not a guaranteed result.
          </p>
        </div>

        <div className="flex justify-end border-t bg-muted/20 px-4 py-3">
          <Button size="sm" variant="outline" className="text-xs" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
