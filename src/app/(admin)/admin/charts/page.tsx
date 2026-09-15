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
  CheckCircle,
  TrendingDown,
  Wind,
  Thermometer,
  Droplets,
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

const emptyRow = (): ChartRow => ({
  label: "",
  day: 0,
  co2Control: 0,
  co2Exp: 0,
  o2Control: 0,
  o2Exp: 0,
  tempControl: 0,
  tempExp: 0,
  humidityControl: 0,
  humidityExp: 0,
});

export default function AdminChartsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/chart-data")
        .then((r) => r.json())
        .then((data) => {
          setRows(data.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  function addRow() {
    const nextDay = rows.length > 0 ? Math.max(...rows.map((r) => r.day)) + 1 : 1;
    setRows([...rows, { ...emptyRow(), day: nextDay, label: `Day ${nextDay}` }]);
  }

  function updateRow(index: number, field: keyof ChartRow, value: string | number) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/chart-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || !session) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="secondary" className="mb-2 gap-1.5 text-xs border border-cyan-200/60 dark:border-cyan-800/60 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300">
              <BarChart3 className="h-3 w-3" />
              Charts
            </Badge>
            <h1 className="text-3xl font-bold">Manage Chart Data</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Edit sensor readings used in the public dashboard charts
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={addRow} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Row
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : saved ? "Saved" : "Save All"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2 animate-pulse">
                <CardContent className="pt-4"><div className="h-8 bg-muted rounded w-full" /></CardContent>
              </Card>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-5">
              <div className="text-center py-12">
                <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-medium text-muted-foreground mb-1">No chart data yet</p>
                <p className="text-xs text-muted-foreground/60 mb-4">Add rows to populate the dashboard charts.</p>
                <Button onClick={addRow} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Row
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((row, i) => (
              <Card key={i} className="border-2">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        Day {row.day}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground">{row.label}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => removeRow(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <span className="font-mono">Day #</span>
                      </label>
                      <Input type="number" value={row.day} onChange={(e) => updateRow(i, "day", parseInt(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-red-500 mb-1 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" /> CO2 Control
                      </label>
                      <Input type="number" step="0.1" value={row.co2Control} onChange={(e) => updateRow(i, "co2Control", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-emerald-500 mb-1 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" /> CO2 Exp
                      </label>
                      <Input type="number" step="0.1" value={row.co2Exp} onChange={(e) => updateRow(i, "co2Exp", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-green-500 mb-1 flex items-center gap-1">
                        <Wind className="h-3 w-3" /> O2 Control
                      </label>
                      <Input type="number" step="0.1" value={row.o2Control} onChange={(e) => updateRow(i, "o2Control", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-emerald-400 mb-1 flex items-center gap-1">
                        <Wind className="h-3 w-3" /> O2 Exp
                      </label>
                      <Input type="number" step="0.1" value={row.o2Exp} onChange={(e) => updateRow(i, "o2Exp", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    <div>
                      <label className="text-xs font-medium text-orange-500 mb-1 flex items-center gap-1">
                        <Thermometer className="h-3 w-3" /> Temp Control
                      </label>
                      <Input type="number" step="0.1" value={row.tempControl} onChange={(e) => updateRow(i, "tempControl", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-orange-400 mb-1 flex items-center gap-1">
                        <Thermometer className="h-3 w-3" /> Temp Exp
                      </label>
                      <Input type="number" step="0.1" value={row.tempExp} onChange={(e) => updateRow(i, "tempExp", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-blue-500 mb-1 flex items-center gap-1">
                        <Droplets className="h-3 w-3" /> Humidity Control
                      </label>
                      <Input type="number" step="0.1" value={row.humidityControl} onChange={(e) => updateRow(i, "humidityControl", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-blue-400 mb-1 flex items-center gap-1">
                        <Droplets className="h-3 w-3" /> Humidity Exp
                      </label>
                      <Input type="number" step="0.1" value={row.humidityExp} onChange={(e) => updateRow(i, "humidityExp", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
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
