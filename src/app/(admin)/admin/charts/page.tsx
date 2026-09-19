"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Plus,
  Trash2,
  Save,
  X,
  GripVertical,
} from "lucide-react";

interface ChartRow {
  id?: string;
  label: string;
  day: number;
  co2Control: number;
  co2Exp: number;
  o2Control: number;
  o2Exp: number;
  tempControl: number;
  tempExp: number;
  humidityControl: number;
  humidityExp: number;
}

const emptyRow: ChartRow = {
  label: "",
  day: 1,
  co2Control: 0,
  co2Exp: 0,
  o2Control: 0,
  o2Exp: 0,
  tempControl: 0,
  tempExp: 0,
  humidityControl: 0,
  humidityExp: 0,
};

export default function AdminChartsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/chart-data")
        .then((r) => r.json())
        .then((d) => {
          if (d.data && d.data.length > 0) {
            setRows(d.data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  function addRow() {
    const dayNum = rows.length + 1;
    setRows((prev) => [
      ...prev,
      { ...emptyRow, label: `Day ${dayNum}`, day: dayNum },
    ]);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, field: keyof ChartRow, value: string | number) {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/chart-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setError("Failed to save");
    }
    setSaving(false);
  }

  if (status === "loading" || !session) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="secondary" className="mb-2 gap-1.5 text-xs border border-cyan-200/60 dark:border-cyan-800/60 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300">
              <BarChart3 className="h-3 w-3" />
              Experiment Data
            </Badge>
            <h1 className="text-3xl font-bold">Manage Dashboard Data</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add one row per day of your experiment. Data shows on the public dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-green-500">Saved!</span>}
            {error && <span className="text-xs text-red-500">{error}</span>}
            <Button onClick={addRow} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Day
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save All"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-5">
              <div className="text-center py-16">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="font-medium text-muted-foreground">No data yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1 mb-4">
                  Click &quot;Add Day&quot; to start entering your experiment data.
                </p>
                <Button onClick={addRow} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Day
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Header row */}
            <div className="hidden lg:grid lg:grid-cols-[140px_1fr_1fr_1fr_1fr_40px] gap-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div>Day</div>
              <div className="text-center">CO2 (ppm)</div>
              <div className="text-center">Oxygen (%)</div>
              <div className="text-center">Temperature</div>
              <div className="text-center">Humidity (%)</div>
              <div />
            </div>

            {rows.map((row, idx) => (
              <Card key={idx} className="border-2">
                <CardContent className="pt-4 pb-4">
                  <div className="lg:grid lg:grid-cols-[140px_1fr_1fr_1fr_1fr_40px] gap-3 items-center">
                    {/* Day label */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block lg:hidden">Day</label>
                      <Input
                        value={row.label}
                        onChange={(e) => updateRow(idx, "label", e.target.value)}
                        placeholder="Day 1"
                        className="h-9 text-sm font-medium"
                      />
                    </div>

                    {/* CO2 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">Control</label>
                        <Input
                          type="number"
                          value={row.co2Control || ""}
                          onChange={(e) => updateRow(idx, "co2Control", Number(e.target.value))}
                          placeholder="820"
                          className="h-9 text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5 block">Experiment</label>
                        <Input
                          type="number"
                          value={row.co2Exp || ""}
                          onChange={(e) => updateRow(idx, "co2Exp", Number(e.target.value))}
                          placeholder="815"
                          className="h-9 text-sm tabular-nums"
                        />
                      </div>
                    </div>

                    {/* Oxygen */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">Control</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={row.o2Control || ""}
                          onChange={(e) => updateRow(idx, "o2Control", Number(e.target.value))}
                          placeholder="6.2"
                          className="h-9 text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5 block">Experiment</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={row.o2Exp || ""}
                          onChange={(e) => updateRow(idx, "o2Exp", Number(e.target.value))}
                          placeholder="6.3"
                          className="h-9 text-sm tabular-nums"
                        />
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">Control</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={row.tempControl || ""}
                          onChange={(e) => updateRow(idx, "tempControl", Number(e.target.value))}
                          placeholder="21.5"
                          className="h-9 text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5 block">Experiment</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={row.tempExp || ""}
                          onChange={(e) => updateRow(idx, "tempExp", Number(e.target.value))}
                          placeholder="21.6"
                          className="h-9 text-sm tabular-nums"
                        />
                      </div>
                    </div>

                    {/* Humidity */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">Control</label>
                        <Input
                          type="number"
                          value={row.humidityControl || ""}
                          onChange={(e) => updateRow(idx, "humidityControl", Number(e.target.value))}
                          placeholder="58"
                          className="h-9 text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5 block">Experiment</label>
                        <Input
                          type="number"
                          value={row.humidityExp || ""}
                          onChange={(e) => updateRow(idx, "humidityExp", Number(e.target.value))}
                          placeholder="59"
                          className="h-9 text-sm tabular-nums"
                        />
                      </div>
                    </div>

                    {/* Delete */}
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => removeRow(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
