"use client";

import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TIMER_SECONDS } from "@/lib/planner/defaults";

function format(total: number): string {
  const safe = Math.max(0, total);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface TimerProps {
  remaining: number;
  running: boolean;
  onRunningChange: (running: boolean) => void;
  onReset: () => void;
}

export function Timer({ remaining, running, onRunningChange, onReset }: TimerProps) {
  const pct = (remaining / TIMER_SECONDS) * 100;
  const urgent = remaining <= 10 && remaining > 0;
  const warning = remaining <= 30 && remaining > 10;
  const done = remaining === 0;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-background/60 px-2 py-1">
      <div className="flex flex-col leading-none">
        <span
          className={`font-mono text-lg font-bold tabular-nums ${
            done
              ? "text-destructive"
              : urgent
                ? "text-destructive"
                : warning
                  ? "text-amber-500"
                  : "text-foreground"
          }`}
        >
          {format(remaining)}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-foreground">
          {done ? "Time" : "Match"}
        </span>
      </div>
      <div className="hidden sm:flex h-8 w-16 flex-col justify-center gap-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              done
                ? "bg-destructive"
                : urgent
                  ? "bg-destructive"
                  : warning
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-cyan-500 to-emerald-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[9px] text-foreground">2:30 total</span>
      </div>
      <div className="flex items-center gap-0.5">
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label={running ? "Pause timer" : "Start timer"}
          onClick={() => onRunningChange(!running)}
          disabled={done}
        >
          {running ? <Pause /> : <Play />}
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label="Reset timer"
          onClick={onReset}
        >
          <RotateCcw />
        </Button>
      </div>
    </div>
  );
}
