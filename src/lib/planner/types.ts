export type OptionKind = "fixed" | "per" | "exclusive";

export interface MissionOption {
  id: string;
  label: string;
  points: number;
  kind: OptionKind;
  group?: string;
  maxCount?: number;
}

export interface Mission {
  id: string;
  code: string;
  name: string;
  summary: string;
  variable?: boolean;
  options: MissionOption[];
}

export type MissionSelections = Record<string, Record<string, number>>;

export interface ChecklistItemDef {
  id: string;
  label: string;
  detail?: string;
}

export interface PlannerConfig {
  title: string;
  matImageUrl: string;
  checklistItems: ChecklistItemDef[];
}

export interface ChecklistState {
  equipmentInspection: boolean;
  precisionRemaining: number;
  checked: Record<string, boolean>;
}

export interface Waypoint {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface PathPoint {
  x: number;
  y: number;
}

export interface PlannerPath {
  id: string;
  points: PathPoint[];
  color?: string;
}

export interface RobotMarker {
  x: number;
  y: number;
  angle: number;
  width?: number;
  length?: number;
}

export type RiskLevel = "low" | "medium" | "high";

export interface PracticeStat {
  attempts: number;
  successes: number;
}

export interface PlanSettings {
  matchDurationSeconds?: number;
  reliabilityThreshold?: number;
  maxLaunches?: number;
  maxAttachmentChanges?: number;
  showHeading?: boolean;
  units?: "cm" | "m";
  planHealthEnabled?: boolean;
  defaultRobotWidth?: number;
  defaultRobotLength?: number;
  robotSpeedPercent?: number;
}

export interface Run {
  id: string;
  name: string;
  waypoints: Waypoint[];
  paths: PlannerPath[];
  robot: RobotMarker;
  selections: MissionSelections;
  checklist: ChecklistState;
  attachment?: string;
  attachmentImage?: string;
  estimatedSeconds?: number;
  returnsToBase?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  runs: Run[];
  activeRunId: string;
  risk?: Record<string, RiskLevel>;
  practice?: Record<string, PracticeStat>;
  settings?: PlanSettings;
}

export interface PlannerStore {
  version: number;
  plans: Plan[];
  activePlanId: string;
}
