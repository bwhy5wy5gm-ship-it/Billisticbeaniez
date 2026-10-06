"use client";

import { Check, Target, Wrench } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { EQUIPMENT_POINTS, precisionPoints, PRECISION_TOKENS_START } from "@/lib/planner/missions";
import type { ChecklistItemDef, ChecklistState } from "@/lib/planner/types";

interface ChecklistPanelProps {
  checklist: ChecklistState;
  checklistItems: ChecklistItemDef[];
  onChange: (next: ChecklistState) => void;
}

export function ChecklistPanel({ checklist, checklistItems, onChange }: ChecklistPanelProps) {
  const tokens = Array.from({ length: PRECISION_TOKENS_START + 1 }, (_, i) => i);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-card p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Wrench className="h-3.5 w-3.5 text-cyan-500" />
              Equipment inspection
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-foreground">
              All equipment fits in one launch area and under 12 inches, 305 millimeters.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-mono text-xs font-semibold text-foreground">
              {EQUIPMENT_POINTS}
            </span>
            <Switch
              checked={checklist.equipmentInspection}
              onCheckedChange={(checked) =>
                onChange({ ...checklist, equipmentInspection: !!checked })
              }
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-3">
        <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
          <Target className="h-3.5 w-3.5 text-emerald-500" />
          Precision tokens remaining
        </p>
        <p className="mb-2 text-[11px] leading-snug text-foreground">
          Start with {PRECISION_TOKENS_START} tokens, lose one for each interruption outside home.
        </p>
        <div className="grid grid-cols-7 gap-1">
          {tokens.map((count) => {
            const active = checklist.precisionRemaining === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onChange({ ...checklist, precisionRemaining: count })}
                className={cn(
                  "flex flex-col items-center rounded-md border py-1.5 transition-colors",
                  active
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-input bg-background hover:bg-muted"
                )}
              >
                <span className="text-xs font-bold">{count}</span>
                <span className={cn("text-[9px]", active ? "text-white" : "text-foreground")}>
                  {precisionPoints(count)}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-foreground">
          Tokens to points: 0 gives 0, 1 gives 10, 2 gives 15, 3 gives 25, 4 gives 35, 5 gives 50,
          6 gives 50.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-3">
        <p className="mb-2 text-sm font-semibold">Practice checklist</p>
        <div className="flex flex-col gap-1">
          {checklistItems.map((item) => {
            const checked = !!checklist.checked[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...checklist,
                    checked: { ...checklist.checked, [item.id]: !checked },
                  })
                }
                className={cn(
                  "flex items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                  checked ? "bg-emerald-50 dark:bg-emerald-950/30" : "hover:bg-muted/60"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    checked
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-input bg-background"
                  )}
                >
                  {checked && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-xs",
                      checked ? "text-foreground" : "text-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                  {item.detail && (
                    <span className="block text-[10px] text-foreground">{item.detail}</span>
                  )}
                </span>
                <span className="text-[10px] text-foreground">0</span>
              </button>
            );
          })}
          {checklistItems.length === 0 && (
            <p className="text-xs text-foreground">
              No practice items yet, an admin can add them.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
