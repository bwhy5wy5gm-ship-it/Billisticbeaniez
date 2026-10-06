"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MAT_HEIGHT,
  MAT_WIDTH,
  clampRobotCenter,
  robotSize,
  uid,
} from "@/lib/planner/defaults";
import type { PathPoint, PlannerPath, RobotMarker, Waypoint } from "@/lib/planner/types";

export type Tool = "select" | "waypoint" | "path" | "robot" | "erase";

export type Selected =
  | { type: "waypoint"; id: string }
  | { type: "path"; id: string }
  | { type: "robot" }
  | null;

interface MatCanvasProps {
  matImageUrl: string;
  tool: Tool;
  waypoints: Waypoint[];
  paths: PlannerPath[];
  robot: RobotMarker;
  selected: Selected;
  draft: PathPoint[];
  simRunning: boolean;
  simDurationMs: number;
  robotImageUrl: string;
  robotImageRotation: number;
  showHeading: boolean;
  robotDefaults?: { width: number | null; length: number | null };
  onChange: (next: { waypoints?: Waypoint[]; paths?: PlannerPath[]; robot?: RobotMarker }) => void;
  onDraftChange: (draft: PathPoint[]) => void;
  onSelect: (selected: Selected) => void;
  onPathFinish: () => void;
  onToolDone: () => void;
}

interface SimPosition {
  x: number;
  y: number;
  angle: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function MatCanvas({
  matImageUrl,
  tool,
  waypoints,
  paths,
  robot,
  selected,
  draft,
  simRunning,
  simDurationMs,
  robotImageUrl,
  robotImageRotation,
  showHeading,
  robotDefaults,
  onChange,
  onDraftChange,
  onSelect,
  onPathFinish,
  onToolDone,
}: MatCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{
    type: "waypoint" | "robot" | "rotate";
    id?: string;
    dx: number;
    dy: number;
  } | null>(null);
  const [cursor, setCursor] = useState<PathPoint | null>(null);
  const [simPos, setSimPos] = useState<SimPosition | null>(null);
  const fractionRef = useRef(0);

  const route = useMemo(() => {
    const points: PathPoint[] = [{ x: robot.x, y: robot.y }];
    if (paths.length > 0) {
      for (const path of paths) {
        for (const point of path.points) points.push({ x: point.x, y: point.y });
      }
    } else {
      for (const waypoint of waypoints) points.push({ x: waypoint.x, y: waypoint.y });
    }
    return points;
  }, [paths, waypoints, robot.x, robot.y]);

  const routeCum = useMemo(() => {
    const cum = [0];
    for (let i = 1; i < route.length; i++) {
      const dx = route[i].x - route[i - 1].x;
      const dy = route[i].y - route[i - 1].y;
      cum.push(cum[i - 1] + Math.hypot(dx, dy));
    }
    return cum;
  }, [route]);

  useEffect(() => {
    if (!simRunning || fractionRef.current >= 1) return;
    if (routeCum[routeCum.length - 1] <= 0 && route.length <= 1) return;

    function routeAt(fraction: number): SimPosition {
      const total = routeCum[routeCum.length - 1];
      if (total <= 0 || route.length <= 1) {
        return { x: robot.x, y: robot.y, angle: robot.angle };
      }
      const distance = Math.max(0, Math.min(1, fraction)) * total;
      let i = 1;
      while (i < routeCum.length - 1 && routeCum[i] < distance) i++;
      const segment = routeCum[i] - routeCum[i - 1];
      const t = segment > 0 ? (distance - routeCum[i - 1]) / segment : 0;
      const from = route[i - 1];
      const to = route[i];
      return {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        angle: (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI,
      };
    }

    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      fractionRef.current = Math.min(1, fractionRef.current + dt / simDurationMs);
      const next = routeAt(fractionRef.current);
      setSimPos((prev) =>
        prev && prev.x === next.x && prev.y === next.y && prev.angle === next.angle ? prev : next
      );
      if (fractionRef.current < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [simRunning, simDurationMs, route, routeCum, robot]);

  function toLogical(e: { clientX: number; clientY: number }): PathPoint {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
    return {
      x: clamp(((e.clientX - rect.left) / rect.width) * MAT_WIDTH, 0, MAT_WIDTH),
      y: clamp(((e.clientY - rect.top) / rect.height) * MAT_HEIGHT, 0, MAT_HEIGHT),
    };
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (tool !== "path") return;
      if (e.key === "Enter" && draft.length > 1) {
        onPathFinish();
      } else if (e.key === "Escape") {
        onDraftChange([]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tool, draft.length, onPathFinish, onDraftChange]);

  function handleBackgroundDown(e: React.PointerEvent<SVGSVGElement>) {
    const point = toLogical(e);
    if (tool === "waypoint") {
      const waypoint: Waypoint = {
        id: uid(),
        x: Math.round(point.x),
        y: Math.round(point.y),
        label: String(waypoints.length + 1),
      };
      onChange({ waypoints: [...waypoints, waypoint] });
      onSelect({ type: "waypoint", id: waypoint.id });
      onToolDone();
      return;
    }
    if (tool === "robot") {
      const size = robotSize(robot, !!robotImageUrl, robotDefaults);
      const next = clampRobotCenter(Math.round(point.x), Math.round(point.y), size);
      onChange({ robot: { ...robot, x: Math.round(next.x), y: Math.round(next.y) } });
      onSelect({ type: "robot" });
      onToolDone();
      return;
    }
    if (tool === "path") {
      onDraftChange([...draft, { x: Math.round(point.x), y: Math.round(point.y) }]);
      return;
    }
    onSelect(null);
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const point = toLogical(e);
    setCursor(point);
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.type === "rotate") {
      let angle = (Math.atan2(point.y - robot.y, point.x - robot.x) * 180) / Math.PI;
      if (e.shiftKey) angle = Math.round(angle / 15) * 15;
      angle = ((Math.round(angle) % 360) + 360) % 360;
      onChange({ robot: { ...robot, angle } });
      return;
    }
    const x = Math.round(point.x - drag.dx);
    const y = Math.round(point.y - drag.dy);
    if (drag.type === "robot") {
      const size = robotSize(robot, !!robotImageUrl, robotDefaults);
      const next = clampRobotCenter(x, y, size);
      onChange({ robot: { ...robot, x: next.x, y: next.y } });
      return;
    }
    onChange({
      waypoints: waypoints.map((w) =>
        w.id === drag.id
          ? { ...w, x: clamp(x, 0, MAT_WIDTH), y: clamp(y, 0, MAT_HEIGHT) }
          : w
      ),
    });
  }

  function endDrag() {
    dragRef.current = null;
  }

  function waypointDown(e: React.PointerEvent, waypoint: Waypoint) {
    if (tool === "erase") {
      e.stopPropagation();
      onChange({ waypoints: waypoints.filter((w) => w.id !== waypoint.id) });
      onSelect(null);
      return;
    }
    if (tool !== "select") return;
    e.stopPropagation();
    const point = toLogical(e);
    onSelect({ type: "waypoint", id: waypoint.id });
    dragRef.current = { type: "waypoint", id: waypoint.id, dx: point.x - waypoint.x, dy: point.y - waypoint.y };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }

  function robotDown(e: React.PointerEvent) {
    if (tool !== "select" || simPos) return;
    e.stopPropagation();
    const point = toLogical(e);
    onSelect({ type: "robot" });
    dragRef.current = { type: "robot", dx: point.x - robot.x, dy: point.y - robot.y };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }

  function rotateDown(e: React.PointerEvent) {
    if (tool !== "select" || simPos) return;
    e.stopPropagation();
    onSelect({ type: "robot" });
    dragRef.current = { type: "rotate", dx: 0, dy: 0 };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }

  function pathDown(e: React.PointerEvent, path: PlannerPath) {
    if (tool === "erase") {
      e.stopPropagation();
      onChange({ paths: paths.filter((p) => p.id !== path.id) });
      onSelect(null);
      return;
    }
    if (tool !== "select") return;
    e.stopPropagation();
    onSelect({ type: "path", id: path.id });
  }

  const draftPoints = [...draft];
  if (tool === "path" && draft.length > 0 && cursor) {
    draftPoints.push({ x: Math.round(cursor.x), y: Math.round(cursor.y) });
  }

  const displayRobot = simPos ?? robot;
  const robotDims = robotSize(robot, !!robotImageUrl, robotDefaults);
  const halfL = robotDims.length / 2;
  const halfW = robotDims.width / 2;
  const headingHalf = Math.max(6, robotDims.width / 6);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border bg-muted/20 shadow-sm">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAT_WIDTH} ${MAT_HEIGHT}`}
        className={`block h-auto w-full touch-none select-none ${
          tool === "select" ? "cursor-default" : tool === "erase" ? "cursor-not-allowed" : "cursor-crosshair"
        }`}
        onPointerDown={handleBackgroundDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => setCursor(null)}
      >
        <defs>
          <pattern id="planner-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="25" cy="25" r="1.5" className="fill-muted-foreground/25" />
          </pattern>
          <marker
            id="planner-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-cyan-500" />
          </marker>
          {robotImageUrl && (
            <clipPath id="planner-robot-clip">
              <rect
                x={-robotDims.length / 2}
                y={-robotDims.width / 2}
                width={robotDims.length}
                height={robotDims.width}
                rx={14}
              />
            </clipPath>
          )}
        </defs>

        <rect x="0" y="0" width={MAT_WIDTH} height={MAT_HEIGHT} className="fill-background" />
        <rect x="0" y="0" width={MAT_WIDTH} height={MAT_HEIGHT} fill="url(#planner-grid)" />

        {matImageUrl ? (
          <image
            href={matImageUrl}
            x="0"
            y="0"
            width={MAT_WIDTH}
            height={MAT_HEIGHT}
            preserveAspectRatio="xMidYMid meet"
            opacity={0.95}
          />
        ) : (
          <g pointerEvents="none">
            <rect
              x="8"
              y="8"
              width={MAT_WIDTH - 16}
              height={MAT_HEIGHT - 16}
              rx="12"
              fill="none"
              className="stroke-border"
              strokeWidth="2"
              strokeDasharray="10 8"
            />
            <text
              x={MAT_WIDTH / 2}
              y={MAT_HEIGHT / 2}
              textAnchor="middle"
              className="fill-foreground"
              fontSize="26"
              fontWeight="600"
            >
              Placeholder mat, admin can upload the official image
            </text>
            <text
              x={MAT_WIDTH / 2}
              y={MAT_HEIGHT / 2 + 36}
              textAnchor="middle"
              className="fill-foreground"
              fontSize="18"
            >
              1200 by 600 planning grid
            </text>
          </g>
        )}

        {paths.map((path) => {
          const pts = path.points.map((p) => `${p.x},${p.y}`).join(" ");
          const isSelected = selected?.type === "path" && selected.id === path.id;
          return (
            <g key={path.id}>
              <polyline
                points={pts}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                strokeLinejoin="round"
                strokeLinecap="round"
                className="cursor-pointer"
                onPointerDown={(e) => pathDown(e, path)}
              />
              <polyline
                points={pts}
                fill="none"
                stroke={typeof path.color === "string" && path.color ? path.color : undefined}
                className={
                  typeof path.color === "string" && path.color
                    ? undefined
                    : isSelected
                      ? "stroke-emerald-500"
                      : "stroke-cyan-500/80"
                }
                strokeWidth={isSelected ? 6 : 4}
                strokeLinejoin="round"
                strokeLinecap="round"
                markerEnd="url(#planner-arrow)"
                pointerEvents="none"
              />
            </g>
          );
        })}

        {draftPoints.length > 0 && (
          <polyline
            points={draftPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            className="stroke-emerald-500"
            strokeWidth={4}
            strokeDasharray="10 6"
            strokeLinejoin="round"
            strokeLinecap="round"
            pointerEvents="none"
          />
        )}

        {waypoints.map((waypoint, index) => {
          const isSelected = selected?.type === "waypoint" && selected.id === waypoint.id;
          return (
            <g key={waypoint.id} className="cursor-move">
              {isSelected && (
                <circle
                  cx={waypoint.x}
                  cy={waypoint.y}
                  r={22}
                  fill="none"
                  className="stroke-emerald-500"
                  strokeWidth={3}
                  strokeDasharray="5 4"
                  pointerEvents="none"
                />
              )}
              <circle
                cx={waypoint.x}
                cy={waypoint.y}
                r={14}
                className={`cursor-move ${isSelected ? "fill-emerald-500" : "fill-cyan-500"}`}
                stroke="white"
                strokeWidth={3}
                onPointerDown={(e) => waypointDown(e, waypoint)}
              />
              <text
                x={waypoint.x}
                y={waypoint.y + 6}
                textAnchor="middle"
                fontSize="16"
                fontWeight="700"
                className="pointer-events-none fill-white"
              >
                {index + 1}
              </text>
              {waypoint.label && (
                <text
                  x={waypoint.x}
                  y={waypoint.y + 34}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="600"
                  className="pointer-events-none fill-foreground"
                >
                  {waypoint.label}
                </text>
              )}
            </g>
          );
        })}

        <g
          transform={`translate(${displayRobot.x} ${displayRobot.y}) rotate(${displayRobot.angle})`}
          className="cursor-move"
        >
          {robotImageUrl ? (
            <>
              {selected?.type === "robot" && (
                <rect
                  x={-(halfL + 7)}
                  y={-(halfW + 7)}
                  width={robotDims.length + 14}
                  height={robotDims.width + 14}
                  rx={18}
                  fill="none"
                  className="stroke-emerald-500"
                  strokeWidth={3}
                  strokeDasharray="6 5"
                  pointerEvents="none"
                />
              )}
              <rect
                x={-halfL}
                y={-halfW}
                width={robotDims.length}
                height={robotDims.width}
                rx={14}
                className="fill-white"
                pointerEvents="none"
              />
              <image
                href={robotImageUrl}
                x={-halfL}
                y={-halfW}
                width={robotDims.length}
                height={robotDims.width}
                preserveAspectRatio="xMidYMid meet"
                clipPath="url(#planner-robot-clip)"
                transform={`rotate(${robotImageRotation})`}
                pointerEvents="none"
              />
              <rect
                x={-halfL}
                y={-halfW}
                width={robotDims.length}
                height={robotDims.width}
                rx={14}
                fill="transparent"
                className="stroke-white"
                strokeWidth={3}
                onPointerDown={robotDown}
              />
              {showHeading && (
                <polygon
                  points={`${halfL + 4},${-headingHalf} ${halfL + 20},0 ${halfL + 4},${headingHalf}`}
                  className="pointer-events-none fill-cyan-600 stroke-white"
                  strokeWidth={2}
                />
              )}
            </>
          ) : (
            <>
              {selected?.type === "robot" && (
                <rect
                  x={-(halfL + 8)}
                  y={-(halfW + 8)}
                  width={robotDims.length + 16}
                  height={robotDims.width + 16}
                  rx={14}
                  fill="none"
                  className="stroke-emerald-500"
                  strokeWidth={3}
                  strokeDasharray="6 5"
                  pointerEvents="none"
                />
              )}
              <rect
                x={-halfL}
                y={-halfW}
                width={robotDims.length}
                height={robotDims.width}
                rx={10}
                className={`stroke-white ${selected?.type === "robot" ? "fill-emerald-500" : "fill-cyan-600"}`}
                strokeWidth={3}
                onPointerDown={robotDown}
              />
              {showHeading && (
                <polygon
                  points={`${halfL - 10},${-robotDims.width / 4} ${halfL + 18},0 ${halfL - 10},${robotDims.width / 4}`}
                  className="pointer-events-none fill-white/90"
                />
              )}
              <circle
                cx={-robotDims.length * 0.22}
                cy={0}
                r={Math.min(7, robotDims.width / 6)}
                className="pointer-events-none fill-white/70"
              />
            </>
          )}
          {tool === "select" && !simPos && (
            <g>
              <line
                x1={halfL + 3}
                y1={0}
                x2={halfL + 17}
                y2={0}
                className="stroke-emerald-500"
                strokeWidth={2}
                strokeDasharray="4 4"
                pointerEvents="none"
              />
              <circle
                cx={halfL + 26}
                cy={0}
                r={16}
                fill="transparent"
                className="cursor-grab"
                onPointerDown={rotateDown}
              />
              <circle
                cx={halfL + 26}
                cy={0}
                r={9}
                className="fill-white stroke-emerald-500"
                strokeWidth={3}
                pointerEvents="none"
              />
            </g>
          )}
        </g>
      </svg>

      {cursor && (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-background/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground shadow-sm">
          x {Math.round(cursor.x)} · y {Math.round(cursor.y)}
        </span>
      )}
      {draft.length > 0 && (
        <span className="pointer-events-none absolute top-2 left-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
          Drawing path, {draft.length} points · Enter to finish, Esc to cancel
        </span>
      )}
    </div>
  );
}
