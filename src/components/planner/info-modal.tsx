"use client";

import { useEffect } from "react";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InfoModalProps {
  onClose: () => void;
}

const SECTIONS: { title: string; lines: string[] }[] = [
  {
    title: "Getting started",
    lines: [
      "Pick a plan with the plan dropdown in the header, or press the plus button to create a new plan.",
      "Each plan contains launches. A launch is one trip the robot makes onto the mat during the 2:30 match.",
      "Add a launch with the plus button next to the launch dropdown, then draw its route on the mat.",
    ],
  },
  {
    title: "Drawing on the mat",
    lines: [
      "Select tool: drag the robot and waypoints to move them. The round handle beside the robot rotates it, hold Shift while dragging to snap to 15 degree steps.",
      "Waypoint tool: tap the mat to drop numbered stops the robot visits.",
      "Path tool: tap the mat to add points, then press Finish path or Enter. Esc cancels the draft.",
      "Robot tool: tap the mat to move the robot there. Erase tool: tap a waypoint or path to remove it.",
      "The coloured dots in the toolbar set the line colour for the next path, or recolour the selected path.",
      "Select the robot to edit its width, length and angle with the number fields in the toolbar.",
    ],
  },
  {
    title: "Scoring your launch",
    lines: [
      "Missions tab: pick the points your robot achieved for each mission on this launch.",
      "Checklist tab: precision tokens left and the equipment inspection, these add to the launch total.",
      "The score badge in the header always shows the active launch.",
    ],
  },
  {
    title: "Planning the whole match",
    lines: [
      "Runs tab: every launch from every plan in one list, with pencil buttons to rename plans and launches.",
      "Notes tab: plan name, launch name, plan notes, and the attachment photo for the current launch.",
      "Analyse my plan button: opens the plan analysis with estimated time, launch breakdown, reliability, risk, plan health and evidence based suggestions.",
      "In the analysis you can log practice attempts per mission, set a risk level, and edit attachment, estimated seconds and returns for every launch.",
      "Show on mat in the analysis jumps straight to that launch on the mat.",
    ],
  },
  {
    title: "Attachment photos",
    lines: [
      "Upload a photo of the attachment or mission setup for each launch from the Notes tab or from the analysis launch cards.",
      "The photo belongs to the current launch only, so every launch can have its own attachment picture.",
    ],
  },
  {
    title: "Downloads and import",
    lines: [
      "Auto save is off. Your work stays on this device in your browser until you download it.",
      "Downloads page: pick launches, choose JSON for full data, CSV for a spreadsheet, or SVG for a picture of the mat.",
      "Upload a downloaded JSON file on the same page to import everything back, including notes, risk, practice logs and settings.",
      "The Download button in the planner header opens that page.",
    ],
  },
  {
    title: "Settings",
    lines: [
      "Settings tab: match duration, reliability threshold, maximum launches, maximum attachment changes, default robot size, distance units, heading arrow and plan health.",
      "Settings apply to the current plan only and are used by the analysis.",
      "Admins can edit the shared mat image, checklist and missions from the admin site.",
    ],
  },
];

export function InfoModal({ onClose }: InfoModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="How to use the planner"
    >
      <div className="my-auto flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background px-4 py-3">
          <Info className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold">How to use the planner</h2>
            <p className="text-[11px] text-foreground">A quick guide to every tool and tab</p>
          </div>
          <Button
            size="icon-xs"
            variant="ghost"
            className="ml-auto"
            aria-label="Close guide"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-1.5 text-sm font-bold">{section.title}</h3>
              <ul className="space-y-1.5">
                {section.lines.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2 rounded-md border bg-card px-2.5 py-2 text-xs leading-relaxed text-foreground"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-[11px] leading-snug text-foreground">
            Your runs stay on this device while auto save is off. Download them from the Downloads
            page to keep a copy, and upload that file later to bring them back.
          </p>
        </div>

        <div className="flex justify-end border-t bg-background px-4 py-3">
          <Button size="sm" variant="outline" className="text-xs" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
