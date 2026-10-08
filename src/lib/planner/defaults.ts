import type {
  ChecklistState,
  MissionSelections,
  Plan,
  PlanSettings,
  PlannerConfig,
  PlannerStore,
  PracticeStat,
  RiskLevel,
  RobotMarker,
  Run,
} from "./types";

export const STORE_VERSION = 1;
export const MAT_WIDTH = 1200;
export const MAT_HEIGHT = 600;
export const TIMER_SECONDS = 150;
export const PLANS_KEY = "planner.store";
export const OWNER_KEY = "planner.owner";
export const DEVICE_KEY = "planner.device";

export const DEFAULT_CONFIG: PlannerConfig = {
  title: "BioGlow Planner",
  matImageUrl: "",
  checklistItems: [
    { id: "ci1", label: "Robot begins fully in home", detail: "Practice check" },
    { id: "ci2", label: "Attachments secure before launch", detail: "Practice check" },
    { id: "ci3", label: "Mission models reset after every run", detail: "Practice check" },
  ],
};

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function defaultChecklist(): ChecklistState {
  return {
    equipmentInspection: false,
    precisionRemaining: 6,
    checked: {},
  };
}

export function defaultSelections(): MissionSelections {
  return {};
}

export function createRun(name: string): Run {
  return {
    id: uid(),
    name,
    waypoints: [],
    paths: [],
    robot: { x: MAT_WIDTH / 2, y: MAT_HEIGHT / 2, angle: 0 },
    selections: defaultSelections(),
    checklist: defaultChecklist(),
  };
}

export function createPlan(name: string): Plan {
  const run = createRun("Run 1");
  return {
    id: uid(),
    name,
    notes: "",
    createdAt: new Date().toISOString(),
    runs: [run],
    activeRunId: run.id,
  };
}

export function createStore(): PlannerStore {
  const plan = createPlan("Plan 1");
  return {
    version: STORE_VERSION,
    plans: [plan],
    activePlanId: plan.id,
  };
}

export function guestOwner(): string {
  try {
    const existing = localStorage.getItem(OWNER_KEY);
    if (existing && existing.startsWith("g:")) return existing;
    const uuid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
    const fresh = `g:${uuid}`;
    localStorage.setItem(OWNER_KEY, fresh);
    return fresh;
  } catch {
    return `g:${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
  }
}

export function deviceUuid(): string {
  try {
    const existing = localStorage.getItem(DEVICE_KEY);
    if (existing && existing.length >= 6) return existing;
    const uuid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
    localStorage.setItem(DEVICE_KEY, uuid);
    return uuid;
  } catch {
    return `${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
  }
}

export function userDeviceOwner(userId: string): string {
  return `u:${userId}.${deviceUuid()}`;
}

export function activePlan(store: PlannerStore): Plan {
  return store.plans.find((p) => p.id === store.activePlanId) || store.plans[0];
}

export function activeRun(plan: Plan): Run {
  return plan.runs.find((r) => r.id === plan.activeRunId) || plan.runs[0];
}

const OWNER_PATTERN = /^[ug]:[A-Za-z0-9.-]{6,96}$/;

export function isValidOwner(owner: string): boolean {
  return OWNER_PATTERN.test(owner);
}

export function normalizeStore(raw: unknown): PlannerStore | null {
  if (!raw || typeof raw !== "object") return null;
  const store = raw as PlannerStore;
  if (!Array.isArray(store.plans) || store.plans.length === 0) return null;
  const plans: Plan[] = [];
  for (const plan of store.plans) {
    if (!plan || typeof plan !== "object" || !Array.isArray(plan.runs) || plan.runs.length === 0) {
      continue;
    }
    const runs: Run[] = [];
    for (const run of plan.runs) {
      if (!run || typeof run !== "object") continue;
      const rawRobot = run.robot && typeof run.robot === "object" ? run.robot : null;
      const robot: RobotMarker = rawRobot
        ? { x: Number(rawRobot.x) || 0, y: Number(rawRobot.y) || 0, angle: Number(rawRobot.angle) || 0 }
        : { x: MAT_WIDTH / 2, y: MAT_HEIGHT / 2, angle: 0 };
      if (rawRobot && typeof rawRobot.width === "number" && Number.isFinite(rawRobot.width) && rawRobot.width > 0) {
        robot.width = rawRobot.width;
      }
      if (rawRobot && typeof rawRobot.length === "number" && Number.isFinite(rawRobot.length) && rawRobot.length > 0) {
        robot.length = rawRobot.length;
      }
      runs.push({
        id: typeof run.id === "string" ? run.id : uid(),
        name: typeof run.name === "string" ? run.name : "Run",
        waypoints: Array.isArray(run.waypoints) ? run.waypoints : [],
        paths: Array.isArray(run.paths) ? run.paths : [],
        robot,
        selections: run.selections && typeof run.selections === "object" ? run.selections : {},
        checklist: run.checklist && typeof run.checklist === "object"
          ? {
              equipmentInspection: !!run.checklist.equipmentInspection,
              precisionRemaining: Number.isFinite(run.checklist.precisionRemaining)
                ? Math.max(0, Math.min(6, Math.round(run.checklist.precisionRemaining)))
                : 6,
              checked: run.checklist.checked && typeof run.checklist.checked === "object"
                ? run.checklist.checked
                : {},
            }
          : defaultChecklist(),
        ...(typeof run.attachment === "string" && run.attachment.trim()
          ? { attachment: run.attachment.trim() }
          : {}),
        ...(typeof run.attachmentImage === "string" && /^https?:\/\//.test(run.attachmentImage)
          ? { attachmentImage: run.attachmentImage }
          : {}),
        ...(typeof run.estimatedSeconds === "number" &&
        Number.isFinite(run.estimatedSeconds) &&
        run.estimatedSeconds > 0
          ? { estimatedSeconds: Math.round(run.estimatedSeconds) }
          : {}),
        ...(typeof run.returnsToBase === "boolean" ? { returnsToBase: run.returnsToBase } : {}),
      });
    }
    if (runs.length === 0) continue;
    const planRisk = sanitizeRisk(plan.risk);
    const planPractice = sanitizePractice(plan.practice);
    const planSettings = sanitizeSettings(plan.settings);
    plans.push({
      id: typeof plan.id === "string" ? plan.id : uid(),
      name: typeof plan.name === "string" ? plan.name : "Plan",
      notes: typeof plan.notes === "string" ? plan.notes : "",
      createdAt: typeof plan.createdAt === "string" ? plan.createdAt : new Date().toISOString(),
      runs,
      activeRunId: runs.some((r) => r.id === plan.activeRunId)
        ? plan.activeRunId
        : runs[0].id,
      ...(planRisk ? { risk: planRisk } : {}),
      ...(planPractice ? { practice: planPractice } : {}),
      ...(Object.keys(planSettings).length > 0 ? { settings: planSettings } : {}),
    });
  }
  if (plans.length === 0) return null;
  return {
    version: STORE_VERSION,
    plans,
    activePlanId: plans.some((p) => p.id === store.activePlanId)
      ? store.activePlanId
      : plans[0].id,
  };
}

export function normalizeConfig(raw: unknown): PlannerConfig {
  const cfg = (raw && typeof raw === "object" ? raw : {}) as Partial<PlannerConfig>;
  return {
    title: typeof cfg.title === "string" && cfg.title.trim() ? cfg.title : DEFAULT_CONFIG.title,
    matImageUrl: typeof cfg.matImageUrl === "string" ? cfg.matImageUrl : "",
    checklistItems: Array.isArray(cfg.checklistItems)
      ? cfg.checklistItems
          .filter((i) => i && typeof i === "object" && typeof i.label === "string" && i.label.trim())
          .map((i) => ({
            id: typeof i.id === "string" && i.id ? i.id : uid(),
            label: i.label,
            detail: typeof i.detail === "string" ? i.detail : undefined,
          }))
      : DEFAULT_CONFIG.checklistItems,
  };
}

export function emptyRobot(): RobotMarker {
  return { x: MAT_WIDTH / 2, y: MAT_HEIGHT / 2, angle: 0 };
}

function clampNum(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function sanitizeSettings(raw: unknown): PlanSettings {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: PlanSettings = {};
  const int = (v: unknown, min: number, max: number): number | null =>
    typeof v === "number" && Number.isFinite(v) ? Math.round(clampNum(v, min, max)) : null;
  const md = int(s.matchDurationSeconds, 30, 900);
  if (md !== null) out.matchDurationSeconds = md;
  const rt = int(s.reliabilityThreshold, 0, 100);
  if (rt !== null) out.reliabilityThreshold = rt;
  const ml = int(s.maxLaunches, 1, 60);
  if (ml !== null) out.maxLaunches = ml;
  const mc = int(s.maxAttachmentChanges, 0, 60);
  if (mc !== null) out.maxAttachmentChanges = mc;
  if (typeof s.showHeading === "boolean") out.showHeading = s.showHeading;
  if (s.units === "cm" || s.units === "m") out.units = s.units;
  if (typeof s.planHealthEnabled === "boolean") out.planHealthEnabled = s.planHealthEnabled;
  const dw = int(s.defaultRobotWidth, 20, 400);
  if (dw !== null) out.defaultRobotWidth = dw;
  const dl = int(s.defaultRobotLength, 20, 400);
  if (dl !== null) out.defaultRobotLength = dl;
  const sp = int(s.robotSpeedPercent, 25, 400);
  if (sp !== null) out.robotSpeedPercent = sp;
  return out;
}

export interface ResolvedSettings {
  matchDurationSeconds: number;
  reliabilityThreshold: number;
  maxLaunches: number;
  maxAttachmentChanges: number;
  showHeading: boolean;
  units: "cm" | "m";
  planHealthEnabled: boolean;
  defaultRobotWidth: number | null;
  defaultRobotLength: number | null;
  robotSpeedPercent: number;
}

export function resolveSettings(plan?: { settings?: PlanSettings } | null): ResolvedSettings {
  const s = sanitizeSettings(plan?.settings);
  return {
    matchDurationSeconds: s.matchDurationSeconds ?? TIMER_SECONDS,
    reliabilityThreshold: s.reliabilityThreshold ?? 80,
    maxLaunches: s.maxLaunches ?? 8,
    maxAttachmentChanges: s.maxAttachmentChanges ?? 3,
    showHeading: s.showHeading ?? true,
    units: s.units ?? "m",
    planHealthEnabled: s.planHealthEnabled ?? true,
    defaultRobotWidth: s.defaultRobotWidth ?? null,
    defaultRobotLength: s.defaultRobotLength ?? null,
    robotSpeedPercent: s.robotSpeedPercent ?? 100,
  };
}

export function robotSize(
  robot: RobotMarker,
  hasImage: boolean,
  fallback?: { width?: number | null; length?: number | null }
): { width: number; length: number } {
  const valid = (v: number | null | undefined): v is number =>
    typeof v === "number" && Number.isFinite(v) && v > 0;
  const width = valid(robot.width)
    ? robot.width
    : valid(fallback?.width)
      ? fallback.width
      : hasImage
        ? 76
        : 48;
  const length = valid(robot.length)
    ? robot.length
    : valid(fallback?.length)
      ? fallback.length
      : hasImage
        ? 76
        : 64;
  return { width, length };
}

export function clampRobotCenter(
  x: number,
  y: number,
  size: { width: number; length: number }
): { x: number; y: number } {
  const half = Math.max(size.width, size.length) / 2;
  return {
    x: clampNum(x, half, MAT_WIDTH - half),
    y: clampNum(y, half, MAT_HEIGHT - half),
  };
}

export function sanitizeRisk(raw: unknown): Record<string, RiskLevel> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: Record<string, RiskLevel> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === "low" || value === "medium" || value === "high") out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function sanitizePractice(raw: unknown): Record<string, PracticeStat> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: Record<string, PracticeStat> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const stat = value as { attempts?: unknown; successes?: unknown };
    const attempts =
      typeof stat.attempts === "number" && Number.isFinite(stat.attempts)
        ? Math.max(0, Math.round(stat.attempts))
        : 0;
    if (attempts <= 0) continue;
    const successes =
      typeof stat.successes === "number" && Number.isFinite(stat.successes)
        ? Math.min(attempts, Math.max(0, Math.round(stat.successes)))
        : 0;
    out[key] = { attempts, successes };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
