"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  Droplets,
  Wind,
  Thermometer,
  TrendingDown,
  BarChart3,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/chart-data")
      .then((r) => r.json())
      .then((d) => {
        if (d.data && d.data.length > 0) {
          setData(d.data);
        }
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
      })
      .catch(() => {
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
      });
  }, []);

  const metrics = [
    {
      id: "co2",
      label: "CO2",
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200/50 dark:border-red-800/30",
      controlKey: "co2Control",
      expKey: "co2Exp",
      unit: "ppm",
    },
    {
      id: "o2",
      label: "Oxygen",
      icon: Wind,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-200/50 dark:border-green-800/30",
      controlKey: "o2Control",
      expKey: "o2Exp",
      unit: "%",
    },
    {
      id: "temp",
      label: "Temperature",
      icon: Thermometer,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-orange-200/50 dark:border-orange-800/30",
      controlKey: "tempControl",
      expKey: "tempExp",
      unit: "\u00B0C",
    },
    {
      id: "humidity",
      label: "Humidity",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200/50 dark:border-blue-800/30",
      controlKey: "humidityControl",
      expKey: "humidityExp",
      unit: "%",
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <Badge variant="secondary" className="mb-3 gap-1.5 px-4 py-1.5 text-sm border border-blue-200/60 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
              <Activity className="h-3.5 w-3.5" />
              Live Data
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">Dashboard</h1>
            <p className="text-lg text-muted-foreground mt-1">
              Real-time sensor data from both tanks
              {lastUpdated && (
                <span className="ml-2">Updated {lastUpdated}</span>
              )}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="h-[300px] bg-muted rounded-xl animate-pulse" />
          </div>
        ) : data.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-5">
              <div className="text-center py-16">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="font-medium text-muted-foreground">No experiment data yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Data will appear here once it&apos;s added in the admin dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m) => {
            const latest = data[data.length - 1];
            const controlVal = latest[m.controlKey as keyof typeof latest];
            const expVal = latest[m.expKey as keyof typeof latest];
            return (
              <Card key={m.id} className="border-2">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg ${m.bg}`}>
                      <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {m.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Control
                      </p>
                      <p className="text-lg font-bold tabular-nums">
                        {controlVal}
                        <span className="text-xs font-normal text-muted-foreground ml-0.5">
                          {m.unit}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-0.5">
                        Experiment
                      </p>
                      <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {expVal}
                        <span className="text-xs font-normal text-emerald-600/60 dark:text-emerald-400/60 ml-0.5">
                          {m.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="co2" className="mb-8">
          <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
            {metrics.map((m) => (
              <TabsTrigger key={m.id} value={m.id} className="gap-1.5 text-xs">
                <m.icon className="h-3 w-3 hidden sm:inline" />
                {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {metrics.map((m) => (
            <TabsContent key={m.id} value={m.id}>
              <Card className="border-2">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <m.icon className={`h-4 w-4 ${m.color}`} />
                    <h3 className="font-semibold text-sm">
                      {m.label} Over Time
                    </h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.5rem",
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey={m.controlKey}
                          stroke="#94a3b8"
                          strokeWidth={2}
                          name="Control"
                          dot={{ r: 3, fill: "#94a3b8" }}
                        />
                        <Line
                          type="monotone"
                          dataKey={m.expKey}
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Experiment"
                          dot={{ r: 3, fill: "#10b981" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                      Control
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Experiment
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
