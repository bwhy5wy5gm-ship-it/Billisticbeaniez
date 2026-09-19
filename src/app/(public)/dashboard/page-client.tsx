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
} from "lucide-react";

const fallbackData = [
  { label: "Day 1", co2Control: 820, co2Exp: 815, o2Control: 6.2, o2Exp: 6.3, tempControl: 21.5, tempExp: 21.6, humidityControl: 58, humidityExp: 59 },
  { label: "Day 2", co2Control: 822, co2Exp: 805, o2Control: 6.2, o2Exp: 6.5, tempControl: 21.7, tempExp: 21.8, humidityControl: 57, humidityExp: 60 },
  { label: "Day 3", co2Control: 825, co2Exp: 788, o2Control: 6.1, o2Exp: 6.8, tempControl: 21.4, tempExp: 21.5, humidityControl: 59, humidityExp: 61 },
  { label: "Day 4", co2Control: 824, co2Exp: 770, o2Control: 6.2, o2Exp: 7.0, tempControl: 21.6, tempExp: 21.7, humidityControl: 58, humidityExp: 60 },
  { label: "Day 5", co2Control: 826, co2Exp: 752, o2Control: 6.1, o2Exp: 7.3, tempControl: 21.8, tempExp: 21.9, humidityControl: 57, humidityExp: 62 },
  { label: "Day 6", co2Control: 823, co2Exp: 735, o2Control: 6.2, o2Exp: 7.5, tempControl: 21.5, tempExp: 21.6, humidityControl: 58, humidityExp: 61 },
  { label: "Day 7", co2Control: 825, co2Exp: 718, o2Control: 6.1, o2Exp: 7.8, tempControl: 21.7, tempExp: 21.8, humidityControl: 59, humidityExp: 63 },
];

export default function DashboardPage() {
  const [data, setData] = useState(fallbackData);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    fetch("/api/admin/chart-data")
      .then((r) => r.json())
      .then((d) => {
        if (d.data && d.data.length > 0) {
          setData(d.data);
        }
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(() => setLastUpdated(new Date().toLocaleTimeString()));
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Badge variant="secondary" className="mb-2 gap-1.5 text-xs border border-blue-200/60 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
              <Activity className="h-3 w-3" />
              Live Data
            </Badge>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time sensor data from both tanks
              {lastUpdated && (
                <span className="ml-2">Updated {lastUpdated}</span>
              )}
            </p>
          </div>
        </div>

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
      </div>
    </div>
  );
}
