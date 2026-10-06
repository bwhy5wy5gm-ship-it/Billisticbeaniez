import {
  MAT_HEIGHT,
  MAT_WIDTH,
  normalizeStore,
  sanitizePractice,
  sanitizeRisk,
  sanitizeSettings,
} from "./defaults";
import { scoreMission, totalForRun } from "./missions";
import type {
  Mission,
  Plan,
  PlanSettings,
  PracticeStat,
  RiskLevel,
  Run,
} from "./types";

export const EXPORT_KIND = "billisticbeaniez.planner.runs";

export interface PlanData {
  notes?: string;
  risk?: Record<string, RiskLevel>;
  practice?: Record<string, PracticeStat>;
  settings?: PlanSettings;
}

export interface ExportedRun {
  planName: string;
  createdAt: string;
  run: Run;
  planData?: PlanData;
}

export function buildPlanData(plan: Plan): PlanData | undefined {
  const out: PlanData = {};
  if (plan.notes) out.notes = plan.notes;
  if (plan.risk && Object.keys(plan.risk).length > 0) out.risk = plan.risk;
  if (plan.practice && Object.keys(plan.practice).length > 0) out.practice = plan.practice;
  if (plan.settings && Object.keys(plan.settings).length > 0) out.settings = plan.settings;
  return Object.keys(out).length > 0 ? out : undefined;
}

export function sanitizePlanData(raw: unknown): PlanData | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const out: PlanData = {};
  if (typeof o.notes === "string" && o.notes) out.notes = o.notes;
  const risk = sanitizeRisk(o.risk);
  if (risk) out.risk = risk;
  const practice = sanitizePractice(o.practice);
  if (practice) out.practice = practice;
  const settings = sanitizeSettings(o.settings);
  if (Object.keys(settings).length > 0) out.settings = settings;
  return Object.keys(out).length > 0 ? out : undefined;
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "run"
  );
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildRunsJson(entries: ExportedRun[]): string {
  return JSON.stringify(
    {
      kind: EXPORT_KIND,
      version: 1,
      exportedAt: new Date().toISOString(),
      team: "Billistic Beaniez",
      runs: entries,
    },
    null,
    2
  );
}

export function buildRunsCsv(entries: ExportedRun[], missions: Mission[]): string {
  const header = [
    "plan",
    "run",
    "created",
    "total points",
    "mission points",
    "precision points",
    "equipment points",
    "waypoints",
    "paths",
    "robot x",
    "robot y",
    "robot angle",
    "attachment",
    "estimated seconds",
    "returns to base",
    "missions selected",
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const entry of entries) {
    const totals = totalForRun(missions, entry.run.selections, entry.run.checklist);
    const bits: string[] = [];
    for (const mission of missions) {
      const points = scoreMission(mission, entry.run.selections[mission.id]);
      if (points > 0) bits.push(`${mission.code} ${mission.name}=${points}`);
    }
    lines.push(
      [
        entry.planName,
        entry.run.name,
        entry.createdAt,
        `${totals.variableMissions > 0 && totals.total > 0 ? ">=" : ""}${totals.total}`,
        totals.missionPoints,
        totals.precision,
        totals.equipment,
        entry.run.waypoints.length,
        entry.run.paths.length,
        Math.round(entry.run.robot.x),
        Math.round(entry.run.robot.y),
        Math.round(entry.run.robot.angle),
        entry.run.attachment ?? "",
        entry.run.estimatedSeconds ?? "",
        entry.run.returnsToBase === undefined
          ? ""
          : entry.run.returnsToBase
            ? "Yes"
            : "No",
        bits.join("; "),
      ]
        .map(csvCell)
        .join(",")
    );
  }
  return "\uFEFF" + lines.join("\r\n");
}

export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const clean = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows.shift() ?? [];
  return { headers, rows: rows.filter((r) => r.some((cell) => cell.trim() !== "")) };
}

export function extractRuns(data: unknown): ExportedRun[] {
  if (!data || typeof data !== "object") {
    throw new Error("That file is not a planner download");
  }
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.runs)) {
    const entries: ExportedRun[] = [];
    for (const item of d.runs as unknown[]) {
      if (!item || typeof item !== "object") continue;
      const it = item as { planName?: unknown; createdAt?: unknown; run?: unknown; planData?: unknown };
      if (it.run && typeof it.run === "object") {
        const planData = sanitizePlanData(it.planData);
        entries.push({
          planName: typeof it.planName === "string" && it.planName ? it.planName : "Imported",
          createdAt: typeof it.createdAt === "string" ? it.createdAt : new Date().toISOString(),
          run: it.run as Run,
          ...(planData ? { planData } : {}),
        });
      } else {
        entries.push({
          planName: "Imported",
          createdAt: typeof it.createdAt === "string" ? it.createdAt : new Date().toISOString(),
          run: item as Run,
        });
      }
    }
    if (entries.length > 0) return entries;
  }
  if (Array.isArray(d.plans)) {
    const store = normalizeStore(d);
    if (store) {
      const entries: ExportedRun[] = [];
      for (const plan of store.plans) {
        const planData = buildPlanData(plan);
        for (const run of plan.runs) {
          entries.push({
            planName: plan.name,
            createdAt: plan.createdAt,
            run,
            ...(planData ? { planData } : {}),
          });
        }
      }
      if (entries.length > 0) return entries;
    }
  }
  if (d.waypoints !== undefined || d.selections !== undefined) {
    return [
      {
        planName: "Imported",
        createdAt: new Date().toISOString(),
        run: d as unknown as Run,
      },
    ];
  }
  throw new Error("That JSON file does not contain planner runs");
}

export function downloadBlob(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

const SVG_STYLE = `
.fill-background{fill:#ffffff}
.fill-foreground{fill:#111827}
.stroke-border{stroke:#d4d4d8}
.fill-muted-foreground\\/25{fill:rgba(113,113,122,.25)}
.fill-muted-foreground\\/50{fill:rgba(113,113,122,.5)}
.fill-muted-foreground\\/60{fill:rgba(113,113,122,.6)}
.fill-cyan-500{fill:#06b6d4}
.fill-cyan-600{fill:#0891b2}
.fill-emerald-500{fill:#10b981}
.fill-white{fill:#ffffff}
.fill-white\\/70{fill:rgba(255,255,255,.7)}
.fill-white\\/90{fill:rgba(255,255,255,.9)}
.stroke-white{stroke:#ffffff}
.stroke-cyan-500\\/80{stroke:rgba(6,182,212,.8)}
.stroke-emerald-500{stroke:#10b981}
text{font-family:Inter,Arial,sans-serif}
`;

export function serializeSvgToMarkup(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(MAT_WIDTH));
  clone.setAttribute("height", String(MAT_HEIGHT));
  clone.removeAttribute("class");
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = SVG_STYLE;
  clone.insertBefore(style, clone.firstChild);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
}
