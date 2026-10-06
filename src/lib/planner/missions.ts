import type { Mission, MissionSelections, MissionOption } from "./types";

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: "m01",
    code: "M01",
    name: "Drone Survey",
    summary:
      "The drone must clear the mat by 20. The bonus needs the LiDAR map completely flipped, with the scan marker partly in the survey area.",
    options: [
      { id: "a", label: "Drone not touching the mat", points: 20, kind: "fixed" },
      {
        id: "b",
        label: "Bonus, LiDAR map completely flipped with scan marker partly in survey area",
        points: 10,
        kind: "fixed",
      },
    ],
  },
  {
    id: "m02",
    code: "M02",
    name: "Exploding Seeds",
    summary:
      "10 points for each seed that is no longer touching the stalk. The number of seeds on the field is not fixed, so the maximum is variable.",
    variable: true,
    options: [
      { id: "a", label: "Seed no longer touching the stalk", points: 10, kind: "per" },
    ],
  },
  {
    id: "m03",
    code: "M03",
    name: "Flip the Rock",
    summary:
      "The research flag down scores 20. The bonus of 10 needs the rock back in its original start position.",
    options: [
      { id: "a", label: "Research flag down", points: 20, kind: "fixed" },
      { id: "b", label: "Bonus, rock returned to its original start position", points: 10, kind: "fixed" },
    ],
  },
  {
    id: "m04",
    code: "M04",
    name: "Lucky Leaves",
    summary:
      "10 for one leaf removed, plus a 20 bonus for the second leaf removed with the katydid in its original start position. A katydid outside the habitat scores 0.",
    options: [
      { id: "a", label: "One leaf removed", points: 10, kind: "fixed" },
      {
        id: "b",
        label: "Bonus, second leaf removed with katydid in original start position",
        points: 20,
        kind: "fixed",
      },
    ],
  },
  {
    id: "m05",
    code: "M05",
    name: "Reaching Roots",
    summary: "Only one level can score, so pick either partial or complete extension.",
    options: [
      { id: "a", label: "Root partially extended", points: 10, kind: "exclusive", group: "extend" },
      { id: "b", label: "Root completely extended", points: 20, kind: "exclusive", group: "extend" },
    ],
  },
  {
    id: "m06",
    code: "M06",
    name: "Leafcutter Frenzy",
    summary:
      "10 points for each fragment in the nest while the ant is touching the nest. The fragment count is not fixed, so the maximum is variable.",
    variable: true,
    options: [
      {
        id: "a",
        label: "Fragment in the nest, with the ant touching the nest",
        points: 10,
        kind: "per",
      },
    ],
  },
  {
    id: "m07",
    code: "M07",
    name: "Humongous Fungus",
    summary:
      "The bonus needs a connection with the opposing team fully extended plant root, maximum 2 connections. There is no bonus without an opponent, for example in remote competition.",
    options: [
      { id: "a", label: "Mycelium completely extended", points: 20, kind: "fixed" },
      {
        id: "b",
        label: "Bonus per connection with opposing team plant root, maximum 2",
        points: 10,
        kind: "per",
        maxCount: 2,
      },
    ],
  },
  {
    id: "m08",
    code: "M08",
    name: "Tangled",
    summary: "The vine must be touching the mat.",
    options: [{ id: "a", label: "Vine touching the mat", points: 30, kind: "fixed" }],
  },
  {
    id: "m09",
    code: "M09",
    name: "Research Platform",
    summary: "All three items score separately, for up to 30 points.",
    options: [
      { id: "a", label: "Platform raised", points: 10, kind: "fixed" },
      { id: "b", label: "Camera trap deployed", points: 10, kind: "fixed" },
      { id: "c", label: "Seed not touching the tree", points: 10, kind: "fixed" },
    ],
  },
  {
    id: "m10",
    code: "M10",
    name: "Fragile Microhabitats",
    summary: "Each habitat scores in its own start position, for up to 20 points.",
    options: [
      { id: "a", label: "Spider habitat in its start position", points: 10, kind: "fixed" },
      { id: "b", label: "Snail habitat in its start position", points: 10, kind: "fixed" },
    ],
  },
  {
    id: "m11",
    code: "M11",
    name: "Window to the Past",
    summary: "The root cover must be down and touching the mat.",
    options: [
      { id: "a", label: "Root cover down, touching the mat", points: 20, kind: "fixed" },
    ],
  },
  {
    id: "m12",
    code: "M12",
    name: "Forest Elder",
    summary: "Both items score separately, for up to 30 points.",
    options: [
      { id: "a", label: "Cane completely raised, touching the tree", points: 20, kind: "fixed" },
      { id: "b", label: "Support tie around the post", points: 10, kind: "fixed" },
    ],
  },
  {
    id: "m13",
    code: "M13",
    name: "Keystone Species",
    summary: "Both conditions must be true at the same time for the full 30 points.",
    options: [
      {
        id: "a",
        label: "Keystone species on restoration platform and young trees raised",
        points: 30,
        kind: "fixed",
      },
    ],
  },
  {
    id: "m14",
    code: "M14",
    name: "Seeds of Renewal",
    summary:
      "5 points for each contained seed, plus 5 for each of those seeds also touching the mat. The seed count is not fixed, so the maximum is variable.",
    variable: true,
    options: [
      { id: "a", label: "Seed contained in the replantation station", points: 5, kind: "per" },
      { id: "b", label: "Bonus, contained seed also touching the mat", points: 5, kind: "per" },
    ],
  },
  {
    id: "m15",
    code: "M15",
    name: "Biocentric Architecture",
    summary:
      "The three items score separately. The environmental bonus applies to only one item, for a maximum of 40 points.",
    options: [
      { id: "a", label: "Nesting canopy raised", points: 10, kind: "fixed" },
      { id: "b", label: "Garden skylight completely in", points: 10, kind: "fixed" },
      { id: "c", label: "Compost hatch fully open, touching the mat", points: 10, kind: "fixed" },
      { id: "d", label: "Environmental bonus, one item only", points: 10, kind: "fixed" },
    ],
  },
];

const PRECISION_TABLE: Record<number, number> = {
  0: 0,
  1: 10,
  2: 15,
  3: 25,
  4: 35,
  5: 50,
  6: 50,
};

export const EQUIPMENT_POINTS = 20;
export const PRECISION_TOKENS_START = 6;

export function precisionPoints(remaining: number): number {
  const clamped = Math.max(0, Math.min(6, Math.round(remaining || 0)));
  return PRECISION_TABLE[clamped] ?? 0;
}

export function scoreMission(mission: Mission, selection?: Record<string, number>): number {
  const sel = selection || {};
  let total = 0;
  const exclusiveWinners: Record<string, number[]> = {};
  for (const option of mission.options) {
    const count = sel[option.id] || 0;
    if (count <= 0) continue;
    if (option.kind === "exclusive") {
      const group = option.group || option.id;
      if (!exclusiveWinners[group]) exclusiveWinners[group] = [];
      exclusiveWinners[group].push(option.points);
    } else if (option.kind === "per") {
      const cap = option.maxCount ?? count;
      total += option.points * Math.min(count, cap);
    } else {
      total += option.points;
    }
  }
  for (const points of Object.values(exclusiveWinners)) {
    total += Math.max(...points);
  }
  return total;
}

export function missionMax(mission: Mission): { points: number; variable: boolean } {
  let total = 0;
  let variable = false;
  const exclusiveBest: Record<string, number[]> = {};
  for (const option of mission.options) {
    if (option.kind === "exclusive") {
      const group = option.group || option.id;
      if (!exclusiveBest[group]) exclusiveBest[group] = [];
      exclusiveBest[group].push(option.points);
    } else if (option.kind === "per") {
      if (option.maxCount == null) {
        variable = true;
      } else {
        total += option.points * option.maxCount;
      }
    } else {
      total += option.points;
    }
  }
  for (const points of Object.values(exclusiveBest)) {
    total += Math.max(...points);
  }
  return { points: total, variable: variable || !!mission.variable };
}

export function totalForRun(
  missions: Mission[],
  selections: MissionSelections,
  checklist: { equipmentInspection: boolean; precisionRemaining: number }
): { missionPoints: number; variableMissions: number; precision: number; equipment: number; total: number } {
  let missionPoints = 0;
  let variableMissions = 0;
  for (const mission of missions) {
    const scored = scoreMission(mission, selections[mission.id]);
    missionPoints += scored;
    if (scored > 0 && missionMax(mission).variable) variableMissions += 1;
  }
  const precision = precisionPoints(checklist.precisionRemaining);
  const equipment = checklist.equipmentInspection ? EQUIPMENT_POINTS : 0;
  return {
    missionPoints,
    variableMissions,
    precision,
    equipment,
    total: missionPoints + precision + equipment,
  };
}

export function maxKnownTotal(missions: Mission[]): { points: number; variable: boolean } {
  let points = 0;
  let variable = false;
  for (const mission of missions) {
    const max = missionMax(mission);
    points += max.points;
    if (max.variable) variable = true;
  }
  return { points, variable };
}

export function optionCountCap(option: MissionOption): number {
  return option.maxCount ?? 12;
}
