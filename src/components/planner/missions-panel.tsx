"use client";

import { useMemo, useState } from "react";
import { Check, Minus, Plus, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Mission, MissionSelections, MissionOption } from "@/lib/planner/types";
import { missionMax, optionCountCap, scoreMission } from "@/lib/planner/missions";

interface MissionsPanelProps {
  missions: Mission[];
  selections: MissionSelections;
  onMissionChange: (missionId: string, next: Record<string, number>) => void;
  onResetAll: () => void;
}

function optionMaxed(option: MissionOption, count: number): boolean {
  return option.maxCount != null && count >= option.maxCount;
}

export function MissionsPanel({ missions, selections, onMissionChange, onResetAll }: MissionsPanelProps) {
  const [query, setQuery] = useState("");

  function handleResetAll() {
    if (!confirm("Clear all mission scores for this run?")) return;
    onResetAll();
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return missions;
    return missions.filter(
      (m) =>
        m.code.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.options.some((o) => o.label.toLowerCase().includes(q))
    );
  }, [missions, query]);

  function setOption(mission: Mission, option: MissionOption, nextCount: number) {
    const current = { ...(selections[mission.id] || {}) };
    const capped = Math.max(0, Math.min(optionCountCap(option), nextCount));
    current[option.id] = capped;
    if (capped > 0 && option.kind === "exclusive") {
      const group = option.group || option.id;
      for (const other of mission.options) {
        if (other.id === option.id) continue;
        if ((other.group || other.id) === group) current[other.id] = 0;
      }
    }
    if (capped === 0) delete current[option.id];
    onMissionChange(mission.id, current);
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search missions, M01 to M15"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Button
          size="xs"
          variant="outline"
          className="h-8 shrink-0 gap-1.5"
          onClick={handleResetAll}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset all
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((mission) => {
          const selection = selections[mission.id] || {};
          const score = scoreMission(mission, selection);
          const max = missionMax(mission);
          const anySelected = Object.values(selection).some((v) => v > 0);

          return (
            <div
              key={mission.id}
              className={cn(
                "rounded-lg border bg-card transition-colors",
                anySelected && "border-cyan-500/50 bg-cyan-50/40 dark:bg-cyan-950/20"
              )}
            >
              <div className="flex items-center gap-2 px-3 pt-2.5">
                <span className="rounded-md bg-cyan-600/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                  {mission.code}
                </span>
                <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug">{mission.name}</h3>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                    score > 0
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-foreground"
                  )}
                >
                  {score}
                  <span className="text-foreground">
                    /{max.variable ? (max.points > 0 ? `≥${max.points}` : "var") : max.points}
                  </span>
                </span>
              </div>
              <p className="px-3 pt-1 text-[11px] leading-snug text-foreground">
                {mission.summary}
              </p>

              <div className="flex flex-col gap-1 p-2">
                {mission.options.map((option) => {
                  const count = selection[option.id] || 0;
                  const isOn = count > 0;

                  if (option.kind === "per") {
                    return (
                      <div
                        key={option.id}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5",
                          isOn && "bg-emerald-50 dark:bg-emerald-950/30"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-xs leading-snug", isOn ? "text-foreground" : "text-foreground")}>
                            {option.label}
                          </p>
                          <p className="text-[10px] text-foreground">
                            {option.points} each
                            {option.maxCount != null ? `, max ${option.maxCount}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon-xs"
                            variant="outline"
                            aria-label="Decrease count"
                            disabled={count === 0}
                            onClick={() => setOption(mission, option, count - 1)}
                          >
                            <Minus />
                          </Button>
                          <span className="w-6 text-center font-mono text-sm font-semibold tabular-nums">
                            {count}
                          </span>
                          <Button
                            size="icon-xs"
                            variant="outline"
                            aria-label="Increase count"
                            disabled={optionMaxed(option, count)}
                            onClick={() => setOption(mission, option, count + 1)}
                          >
                            <Plus />
                          </Button>
                        </div>
                        <span className="w-9 text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          +{count * option.points}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setOption(mission, option, isOn ? 0 : 1)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                        isOn
                          ? "bg-emerald-50 dark:bg-emerald-950/30"
                          : "hover:bg-muted/60"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          isOn
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-input bg-background"
                        )}
                      >
                        {isOn && <Check className="h-3 w-3" />}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 flex-1 text-xs leading-snug",
                          isOn ? "text-foreground" : "text-foreground"
                        )}
                      >
                        {option.label}
                      </span>
                      <span className="shrink-0 font-mono text-xs font-semibold text-foreground">
                        {option.points}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-foreground">
            No missions match that search
          </p>
        )}
      </div>
    </div>
  );
}
