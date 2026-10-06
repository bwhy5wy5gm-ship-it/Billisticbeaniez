import { activeRun, resolveSettings, type ResolvedSettings } from "./defaults";
import { missionMax, scoreMission, totalForRun } from "./missions";
import type { Mission, Plan, Run } from "./types";

const UNITS_PER_METER = 500;

export function pathDistanceUnits(run: Run): number {
  const points: { x: number; y: number }[] = [{ x: run.robot.x, y: run.robot.y }];
  if (run.paths.length > 0) {
    for (const path of run.paths) {
      for (const p of path.points) points.push({ x: p.x, y: p.y });
    }
  } else {
    for (const w of run.waypoints) points.push({ x: w.x, y: w.y });
  }
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function distanceLabel(units: number, system: "cm" | "m"): string {
  const meters = units / UNITS_PER_METER;
  if (system === "cm") return `${Math.round(meters * 100)} cm`;
  return `${meters.toFixed(1)} m`;
}

export type FindingLevel = "known" | "warning" | "suggestion";

export interface Finding {
  level: FindingLevel;
  text: string;
}

export interface LaunchMissionRef {
  id: string;
  code: string;
  name: string;
  points: number;
}

export interface LaunchAnalysis {
  runId: string;
  index: number;
  name: string;
  missions: LaunchMissionRef[];
  missionCount: number;
  attachment: string;
  attachmentImage: string;
  estimatedSeconds: number | null;
  returnsToBase: boolean | null;
  distanceUnits: number;
  start: { x: number; y: number; angle: number };
  score: {
    missionPoints: number;
    precision: number;
    equipment: number;
    total: number;
    variableMissions: number;
  };
}

export interface ReliabilityRow {
  missionId: string;
  code: string;
  name: string;
  attempts: number;
  successes: number;
  failures: number;
  pct: number | null;
}

export interface PlanAnalysis {
  settings: ResolvedSettings;
  launches: LaunchAnalysis[];
  totalLaunches: number;
  missionAssignments: number;
  distinctMissions: number;
  avgMissionsPerLaunch: number;
  attachmentKnown: boolean;
  attachmentChanges: number | null;
  returnsKnown: boolean;
  returnsToBase: number | null;
  risk: {
    known: boolean;
    low: number;
    medium: number;
    high: number;
    highMissions: string[];
    unratedMissions: number;
  };
  reliability: {
    known: boolean;
    rows: ReliabilityRow[];
    overallPct: number | null;
    belowCount: number;
    below: ReliabilityRow[];
  };
  score: {
    missionPoints: number;
    precision: number;
    equipment: number;
    total: number;
    variableMissions: number;
    missions: {
      id: string;
      code: string;
      name: string;
      points: number;
      launches: number;
      variable: boolean;
    }[];
  };
  time: {
    known: boolean;
    enteredCount: number;
    totalSeconds: number;
    bufferSeconds: number | null;
    overBy: number | null;
  };
  distance: {
    totalUnits: number;
    longestIndex: number | null;
    medianUnits: number | null;
  };
  warnings: Finding[];
  suggestions: Finding[];
  overall: string;
  health: { enabled: boolean; score: number | null; explanation: string };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function planScore(plan: Plan, missions: Mission[]) {
  let missionPoints = 0;
  let variableMissions = 0;
  const scored: PlanAnalysis["score"]["missions"] = [];
  for (const mission of missions) {
    let best = 0;
    let launches = 0;
    for (const run of plan.runs) {
      const points = scoreMission(mission, run.selections[mission.id]);
      if (points > 0) launches += 1;
      best = Math.max(best, points);
    }
    missionPoints += best;
    const variable = missionMax(mission).variable;
    if (best > 0 && variable) variableMissions += 1;
    if (best > 0) {
      scored.push({ id: mission.id, code: mission.code, name: mission.name, points: best, launches, variable });
    }
  }
  const active = activeRun(plan);
  const totals = totalForRun(missions, active.selections, active.checklist);
  return {
    missionPoints,
    precision: totals.precision,
    equipment: totals.equipment,
    total: missionPoints + totals.precision + totals.equipment,
    variableMissions,
    missions: scored,
  };
}

function buildHealth(
  analysis: {
    totalLaunches: number;
    attachmentKnown: boolean;
    attachmentChanges: number | null;
    distinctMissions: number;
    time: PlanAnalysis["time"];
    reliability: PlanAnalysis["reliability"];
    risk: PlanAnalysis["risk"];
    missionIdsWithPractice: number;
  },
  settings: ResolvedSettings
): { enabled: boolean; score: number | null; explanation: string } {
  if (!settings.planHealthEnabled) {
    return { enabled: false, score: null, explanation: "" };
  }
  const parts: { name: string; points: number; max: number }[] = [];
  const missing: string[] = [];

  if (analysis.time.known && analysis.time.bufferSeconds !== null) {
    const buffer = analysis.time.bufferSeconds;
    const ratio = buffer < 0 ? 0 : Math.min(1, buffer / (0.15 * settings.matchDurationSeconds));
    parts.push({ name: "time margin", points: 25 * ratio, max: 25 });
  } else {
    missing.push("time margin (no launch times entered)");
  }

  if (analysis.reliability.known && analysis.reliability.overallPct !== null) {
    parts.push({
      name: "mission reliability",
      points: 25 * (analysis.reliability.overallPct / 100),
      max: 25,
    });
  } else {
    missing.push("mission reliability (no practice data)");
  }

  parts.push({
    name: "launch count",
    points:
      analysis.totalLaunches <= settings.maxLaunches
        ? 15
        : 15 * (settings.maxLaunches / analysis.totalLaunches),
    max: 15,
  });

  if (analysis.attachmentKnown && analysis.attachmentChanges !== null) {
    parts.push({
      name: "attachment changes",
      points:
        analysis.attachmentChanges <= settings.maxAttachmentChanges
          ? 15
          : analysis.attachmentChanges === 0
            ? 15
            : 15 * (settings.maxAttachmentChanges / analysis.attachmentChanges),
      max: 15,
    });
  } else {
    missing.push("attachment changes (no attachments entered)");
  }

  if (analysis.distinctMissions > 0) {
    parts.push({
      name: "practice coverage",
      points:
        10 * Math.min(1, analysis.missionIdsWithPractice / analysis.distinctMissions),
      max: 10,
    });
  } else {
    missing.push("practice coverage (no missions scored)");
  }

  const ratedCount = analysis.risk.low + analysis.risk.medium + analysis.risk.high;
  if (settings.planHealthEnabled) {
    parts.push({
      name: "risk coverage",
      points: 10 * (ratedCount / Math.max(1, ratedCount + analysis.risk.unratedMissions)),
      max: 10,
    });
    if (ratedCount === 0) missing.push("risk coverage (no risk ratings entered)");
  }

  const totalPoints = parts.reduce((sum, p) => sum + p.points, 0);
  const totalMax = parts.reduce((sum, p) => sum + p.max, 0);
  const score = totalMax > 0 ? Math.round((totalPoints / totalMax) * 100) : null;

  let explanation = "";
  if (score !== null && parts.length > 0) {
    const ranked = [...parts].sort((a, b) => b.points / b.max - a.points / a.max);
    const best = ranked[0];
    const worst = ranked[ranked.length - 1];
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const same = ranked.length === 1 || best.name === worst.name;
    explanation = same
      ? `${cap(best.name)} is the measured area.`
      : `${cap(best.name)} is the strongest measured area, while ${worst.name} needs the most attention.`;
    if (missing.length > 0) explanation += ` Not included: ${missing.join(", ")}.`;
    explanation +=
      " This is a planner generated planning indicator based only on the data entered in this plan, not a scientific measure.";
  }
  return { enabled: true, score, explanation };
}

export function analysePlan(plan: Plan, missions: Mission[]): PlanAnalysis {
  const settings = resolveSettings(plan);

  const launches: LaunchAnalysis[] = plan.runs.map((run, index) => {
    const launchMissions: LaunchMissionRef[] = [];
    for (const mission of missions) {
      const points = scoreMission(mission, run.selections[mission.id]);
      if (points > 0) {
        launchMissions.push({ id: mission.id, code: mission.code, name: mission.name, points });
      }
    }
    const totals = totalForRun(missions, run.selections, run.checklist);
    return {
      runId: run.id,
      index,
      name: run.name,
      missions: launchMissions,
      missionCount: launchMissions.length,
      attachment: run.attachment ?? "",
      attachmentImage: run.attachmentImage ?? "",
      estimatedSeconds:
        typeof run.estimatedSeconds === "number" && run.estimatedSeconds > 0
          ? run.estimatedSeconds
          : null,
      returnsToBase: typeof run.returnsToBase === "boolean" ? run.returnsToBase : null,
      distanceUnits: pathDistanceUnits(run),
      start: { x: run.robot.x, y: run.robot.y, angle: run.robot.angle },
      score: {
        missionPoints: totals.missionPoints,
        precision: totals.precision,
        equipment: totals.equipment,
        total: totals.total,
        variableMissions: totals.variableMissions,
      },
    };
  });

  const totalLaunches = launches.length;
  const missionAssignments = launches.reduce((sum, l) => sum + l.missionCount, 0);
  let distinctMissions = 0;
  for (const mission of missions) {
    if (plan.runs.some((run) => scoreMission(mission, run.selections[mission.id]) > 0)) {
      distinctMissions += 1;
    }
  }
  const avgMissionsPerLaunch =
    totalLaunches > 0 ? Math.round((missionAssignments / totalLaunches) * 10) / 10 : 0;

  const withAttachment = launches.filter((l) => l.attachment.length > 0);
  const attachmentKnown = withAttachment.length > 0;
  let attachmentChanges: number | null = null;
  if (attachmentKnown) {
    attachmentChanges = 0;
    for (let i = 1; i < launches.length; i++) {
      const prev = launches[i - 1].attachment;
      const curr = launches[i].attachment;
      if (prev && curr && prev !== curr) attachmentChanges += 1;
    }
  }

  const returnsEntries = launches.map((l) => l.returnsToBase);
  const returnsKnown = returnsEntries.some((v) => v !== null);
  const returnsToBase = returnsKnown
    ? returnsEntries.filter((v) => v === true).length
    : null;

  const riskEntries = plan.risk ?? {};
  let riskLow = 0;
  let riskMedium = 0;
  let riskHigh = 0;
  const highMissions: string[] = [];
  for (const mission of missions) {
    const level = riskEntries[mission.id];
    if (!level) continue;
    if (level === "low") riskLow += 1;
    else if (level === "medium") riskMedium += 1;
    else {
      riskHigh += 1;
      highMissions.push(`${mission.code} ${mission.name}`);
    }
  }
  const ratedCount = riskLow + riskMedium + riskHigh;
  const unratedMissions = Math.max(0, missions.length - ratedCount);
  const risk = {
    known: ratedCount > 0,
    low: riskLow,
    medium: riskMedium,
    high: riskHigh,
    highMissions,
    unratedMissions,
  };

  const practice = plan.practice ?? {};
  const rows: ReliabilityRow[] = [];
  for (const mission of missions) {
    const stat = practice[mission.id];
    if (!stat || stat.attempts <= 0) continue;
    rows.push({
      missionId: mission.id,
      code: mission.code,
      name: mission.name,
      attempts: stat.attempts,
      successes: stat.successes,
      failures: Math.max(0, stat.attempts - stat.successes),
      pct: Math.round((stat.successes / stat.attempts) * 100),
    });
  }
  const reliabilityKnown = rows.length > 0;
  const totalAttempts = rows.reduce((s, r) => s + r.attempts, 0);
  const totalSuccesses = rows.reduce((s, r) => s + r.successes, 0);
  const overallPct = totalAttempts > 0 ? Math.round((totalSuccesses / totalAttempts) * 100) : null;
  const below = rows.filter((r) => r.pct !== null && r.pct < settings.reliabilityThreshold);
  const reliability = {
    known: reliabilityKnown,
    rows,
    overallPct,
    belowCount: below.length,
    below,
  };

  const score = planScore(plan, missions);

  const timed = launches.filter((l) => l.estimatedSeconds !== null);
  const timeKnown = timed.length > 0;
  const totalSeconds = timed.reduce((s, l) => s + (l.estimatedSeconds ?? 0), 0);
  const bufferSeconds = timeKnown ? settings.matchDurationSeconds - totalSeconds : null;
  const overBy = timeKnown && totalSeconds > settings.matchDurationSeconds
    ? totalSeconds - settings.matchDurationSeconds
    : null;
  const timeInfo = {
    known: timeKnown,
    enteredCount: timed.length,
    totalSeconds,
    bufferSeconds,
    overBy,
  };

  const distances = launches.map((l) => l.distanceUnits);
  const totalDistanceUnits = distances.reduce((s, d) => s + d, 0);
  let longestIndex: number | null = null;
  let medianUnits: number | null = null;
  if (launches.length >= 3) {
    const maxDistance = Math.max(...distances);
    if (maxDistance > 0) {
      const maxIdx = distances.indexOf(maxDistance);
      const others = distances.filter((_, i) => i !== maxIdx);
      const othersMedian = median(others);
      if (othersMedian > 0 && maxDistance > 1.5 * othersMedian) {
        longestIndex = maxIdx;
        medianUnits = othersMedian;
      }
    }
  }

  const warnings: Finding[] = [];
  const suggestions: Finding[] = [];

  if (reliabilityKnown && below.length > 0) {
    warnings.push({
      level: "warning",
      text: `${below.length} ${below.length === 1 ? "mission is" : "missions are"} below ${settings.reliabilityThreshold}% reliability`,
    });
  }
  if (overBy !== null) {
    warnings.push({
      level: "warning",
      text: `Estimated plan exceeds the match time by ${overBy} seconds`,
    });
  }
  if (totalLaunches > settings.maxLaunches) {
    warnings.push({
      level: "warning",
      text: `${totalLaunches} launches is above the preferred maximum of ${settings.maxLaunches}. Potential optimisation: consider combining missions where possible.`,
    });
  }
  if (attachmentKnown && attachmentChanges !== null && attachmentChanges > settings.maxAttachmentChanges) {
    warnings.push({
      level: "warning",
      text: `${attachmentChanges} attachment changes is above the preferred maximum of ${settings.maxAttachmentChanges}`,
    });
  }
  if (longestIndex !== null && medianUnits !== null) {
    const label = settings.units;
    warnings.push({
      level: "warning",
      text: `Launch ${longestIndex + 1} has a particularly long path (${distanceLabel(launches[longestIndex].distanceUnits, label)} compared with a median of ${distanceLabel(medianUnits, label)})`,
    });
  }
  if (riskHigh > 0) {
    warnings.push({
      level: "warning",
      text: `${riskHigh} ${riskHigh === 1 ? "mission is" : "missions are"} marked high risk`,
    });
  }

  for (let i = 1; i < launches.length; i++) {
    const prev = launches[i - 1];
    const curr = launches[i];
    if (prev.attachment && curr.attachment && prev.attachment === curr.attachment) {
      const codes = [...prev.missions, ...curr.missions].map((m) => m.code);
      if (codes.length > 0) {
        suggestions.push({
          level: "suggestion",
          text: `${codes.join(" + ")} may be suitable for one combined launch (both use the ${curr.attachment} attachment)`,
        });
      }
    }
  }
  if (timeKnown && overBy === null) {
    suggestions.push({
      level: "suggestion",
      text: `Estimated time currently fits within the match (${formatClock(totalSeconds)} of ${formatClock(settings.matchDurationSeconds)})`,
    });
  }
  if (reliabilityKnown && below.length > 0) {
    const names = below
      .slice()
      .sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0))
      .slice(0, 3)
      .map((r) => r.code);
    suggestions.push({
      level: "suggestion",
      text: `Potential optimisation: focus practice on ${names.join(", ")}${below.length > 3 ? ` and ${below.length - 3} more` : ""}`,
    });
  }
  for (const launch of launches) {
    if (launch.missionCount === 0) {
      suggestions.push({
        level: "suggestion",
        text: `Potential optimisation: launch ${launch.index + 1} (${launch.name}) has no scored missions, assign missions to it or remove it`,
      });
    }
  }

  let overall: string;
  const hasSelections = plan.runs.some((run) =>
    missions.some((m) => scoreMission(m, run.selections[m.id]) > 0)
  );
  if (!hasSelections) {
    overall = "No missions are scored yet. Add missions and launches to generate a strategy analysis.";
  } else if (overBy !== null) {
    overall = `Timing needs attention first: the estimated plan exceeds the match time by ${overBy} seconds.`;
  } else if (reliabilityKnown && below.length > 0) {
    overall = `Good starting strategy, focus practice on the ${below.length} lowest reliability ${below.length === 1 ? "mission" : "missions"}.`;
  } else if (warnings.length > 0) {
    overall = `${warnings.length} ${warnings.length === 1 ? "warning" : "warnings"} to review, see the launch breakdown below.`;
  } else if (!reliabilityKnown) {
    overall = "Plan structure looks consistent. Log practice attempts to strengthen the analysis.";
  } else {
    overall = "Plan fits the match with no threshold warnings. Keep logging practice to keep the analysis accurate.";
  }

  const health = buildHealth(
    {
      totalLaunches,
      attachmentKnown,
      attachmentChanges,
      distinctMissions,
      time: timeInfo,
      reliability,
      risk,
      missionIdsWithPractice: rows.length,
    },
    settings
  );

  return {
    settings,
    launches,
    totalLaunches,
    missionAssignments,
    distinctMissions,
    avgMissionsPerLaunch,
    attachmentKnown,
    attachmentChanges,
    returnsKnown,
    returnsToBase,
    risk,
    reliability,
    score,
    distance: { totalUnits: totalDistanceUnits, longestIndex, medianUnits },
    time: timeInfo,
    warnings,
    suggestions,
    overall,
    health,
  };
}
