"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Droplets,
  Leaf,
  FlaskConical,
  Thermometer,
  Wind,
  Gauge,
  Calendar,
  Clock,
  Beaker,
  Microscope,
  Timer,
  BarChart3,
} from "lucide-react";

export default function ExperimentDesignPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 gap-1.5 px-4 py-1.5 border border-violet-200/60 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Experiment Design
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How We Run the Experiment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A detailed look at our controlled experiment, including the tanks, sensors,
            timeline, and methodology.
          </p>
        </div>

        {/* Overview */}
        <Card className="border-2 mb-10">
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
              We designed a <strong>controlled experiment</strong> with two
              identical sealed tanks. Both contain saltwater and are fitted with
              the same sensors. The only variable is the addition of seaweed to
              the experiment tank. Sensors record data{" "}
              <strong>every hour for 14 days</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Tank Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 border-slate-200/80 dark:border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                  <Droplets className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Control Tank</h3>
                  <p className="text-xs text-muted-foreground">
                    Baseline measurements
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-center">
                <Droplets className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold">Saltwater Only</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No biological additions
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  5 liters of prepared saltwater
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  Room temperature (20-22 C)
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  Sealed container
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  Full sensor suite active
                </div>
              </div>
              <Badge
                variant="outline"
                className="w-fit text-slate-600 dark:text-slate-400"
              >
                Baseline
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200/80 dark:border-emerald-800/50 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-900/20 px-6 py-4 border-b border-emerald-200/80 dark:border-emerald-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-emerald-950/50 shadow-sm">
                  <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Experiment Tank</h3>
                  <p className="text-xs text-muted-foreground">
                    Biological CO2 absorption
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-center">
                <Leaf className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold">Saltwater + Seaweed</p>
                <p className="text-xs text-muted-foreground mt-1">
                  200g fresh seaweed added
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  5 liters of prepared saltwater
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  200g fresh seaweed (identified species)
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Same temperature, sealed conditions
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Full sensor suite active
                </div>
              </div>
              <Badge className="w-fit bg-emerald-600 hover:bg-emerald-700">
                Active Experiment
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Sensors */}
        <Card className="border-2 mb-12">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-6">
              <Gauge className="h-5 w-5 text-cyan-500" />
              <h2 className="text-xl font-semibold">Sensors & Measurements</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: TrendingDown,
                  name: "CO2",
                  unit: "ppm",
                  desc: "Carbon dioxide concentration in water and air",
                  color: "text-red-500",
                  bg: "bg-red-50 dark:bg-red-950/20",
                  border: "border-red-200/50 dark:border-red-800/30",
                },
                {
                  icon: Wind,
                  name: "Oxygen",
                  unit: "%",
                  desc: "Dissolved oxygen level in water",
                  color: "text-green-500",
                  bg: "bg-green-50 dark:bg-green-950/20",
                  border: "border-green-200/50 dark:border-green-800/30",
                },
                {
                  icon: Thermometer,
                  name: "Temperature",
                  unit: "C",
                  desc: "Water and ambient air temperature",
                  color: "text-orange-500",
                  bg: "bg-orange-50 dark:bg-orange-950/20",
                  border: "border-orange-200/50 dark:border-orange-800/30",
                },
                {
                  icon: Droplets,
                  name: "Humidity",
                  unit: "%",
                  desc: "Air moisture level around the tanks",
                  color: "text-blue-500",
                  bg: "bg-blue-50 dark:bg-blue-950/20",
                  border: "border-blue-200/50 dark:border-blue-800/30",
                },
              ].map((s) => (
                <div
                  key={s.name}
                  className={`flex flex-col items-center text-center p-5 rounded-xl border ${s.border} ${s.bg}`}
                >
                  <div className="p-2.5 rounded-full bg-white dark:bg-black/20 shadow-sm mb-3">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-2 mb-12">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-5 w-5 text-violet-500" />
              <h2 className="text-xl font-semibold">Experiment Timeline</h2>
            </div>
            <div className="relative">
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-300 via-cyan-300 to-emerald-300 dark:from-violet-700 dark:via-cyan-700 dark:to-emerald-700" />
              <div className="space-y-6">
                {[
                  {
                    day: "Day 1",
                    title: "Setup & Baseline",
                    desc: "Prepare both tanks with 5L saltwater each. Install all sensors. Begin recording baseline data for 24 hours before adding seaweed.",
                    icon: Beaker,
                    color: "text-violet-500",
                    bg: "bg-violet-100 dark:bg-violet-900/40",
                  },
                  {
                    day: "Day 2",
                    title: "Introduce Seaweed",
                    desc: "Add 200g of fresh, identified seaweed species to the experiment tank. Seal both tanks and begin the 14-day observation period.",
                    icon: Leaf,
                    color: "text-emerald-500",
                    bg: "bg-emerald-100 dark:bg-emerald-900/40",
                  },
                  {
                    day: "Days 3-12",
                    title: "Data Collection",
                    desc: "Sensors automatically record CO2, O2, temperature, and humidity every hour. Team checks tanks daily for visual changes in water clarity and seaweed health.",
                    icon: BarChart3,
                    color: "text-cyan-500",
                    bg: "bg-cyan-100 dark:bg-cyan-900/40",
                  },
                  {
                    day: "Day 13",
                    title: "Analysis",
                    desc: "Compare all data from both tanks. Calculate CO2 reduction percentages. Identify patterns and anomalies. Prepare charts and graphs.",
                    icon: Microscope,
                    color: "text-blue-500",
                    bg: "bg-blue-100 dark:bg-blue-900/40",
                  },
                  {
                    day: "Day 14",
                    title: "Conclusion",
                    desc: "Write up final results. Determine if hypothesis was supported. Create presentation materials and share findings with judges.",
                    icon: FlaskConical,
                    color: "text-amber-500",
                    bg: "bg-amber-100 dark:bg-amber-900/40",
                  },
                ].map((step, i) => (
                  <div key={i} className="flex gap-5 relative">
                    <div
                      className={`relative z-10 h-10 w-10 rounded-full ${step.bg} flex items-center justify-center shrink-0 ring-4 ring-background`}
                    >
                      <step.icon className={`h-4.5 w-4.5 ${step.color}`} />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs font-mono">
                          {step.day}
                        </Badge>
                      </div>
                      <h4 className="font-semibold mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Variables */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-6">
              <Timer className="h-5 w-5 text-cyan-500" />
              <h2 className="text-xl font-semibold">Key Variables</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">
                  Independent Variable
                </h4>
                <div className="p-4 rounded-xl border-2 border-dashed border-cyan-200 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/20">
                  <p className="font-medium">Presence of Seaweed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The experiment tank has 200g of seaweed; the control tank
                    does not.
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">
                  Dependent Variables
                </h4>
                <div className="space-y-2">
                  {["CO2 concentration", "Oxygen level", "Temperature", "Humidity"].map(
                    (v) => (
                      <div
                        key={v}
                        className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                      >
                        <div className="h-2 w-2 rounded-full bg-cyan-500" />
                        <span className="text-sm font-medium">{v}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TrendingDown(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}
