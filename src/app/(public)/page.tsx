"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Droplets,
  Leaf,
  Wind,
  Thermometer,
  ArrowRight,
  Beaker,
  FlaskConical,
  Activity,
  Gauge,
  Calendar,
  FileText,
  ArrowUpRight,
  Atom,
  TrendingDown,
  FlaskRound,
  Microscope,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={mounted ? "animate-in" : "opacity-0"}>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50/40 to-emerald-50 dark:from-cyan-950/20 dark:via-blue-950/10 dark:to-emerald-950/20" />
        <div className="absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-200/20 dark:bg-cyan-500/5 blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-200/20 dark:bg-emerald-500/5 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <Badge
                variant="secondary"
                className="px-4 py-1.5 text-sm gap-2 border border-cyan-200/60 dark:border-cyan-800/50 bg-white/70 dark:bg-cyan-950/30 backdrop-blur-sm"
              >
                <div className="relative">
                  <Beaker className="h-3.5 w-3.5 text-cyan-500" />
                  <Atom className="h-2 w-2 text-emerald-400 absolute -top-0.5 -right-0.5" />
                </div>
                <span className="font-semibold">
                  <span className="text-cyan-600 dark:text-cyan-400">Billistic</span>{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">Beaniez</span>
                </span>
                <span className="text-muted-foreground/40">|</span>
                FLL Team
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold mb-5 leading-[1.12] text-balance">
              Removing CO2 from{" "}
              <span className="bg-gradient-to-r from-cyan-600 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
                Ocean Water
              </span>{" "}
              Using Biology
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed text-balance">
              We&apos;re testing whether seaweed and phytoplankton can
              measurably reduce dissolved CO2 through photosynthesis, using
              two tanks, four sensors, and 14 days of data.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="gap-2 px-6 shadow-lg shadow-cyan-500/15 hover:shadow-cyan-500/25 transition-shadow"
                >
                  <Activity className="h-4 w-4" />
                  Live Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/experiment-design">
                <Button size="lg" variant="outline" className="gap-2 px-6">
                  <FlaskConical className="h-4 w-4" />
                  Experiment Design
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-b bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { value: "2", label: "Tanks", sub: "Control + Experiment" },
              { value: "4", label: "Sensors", sub: "CO2, O2, Temp, Humidity" },
              { value: "14", label: "Days", sub: "Data collection timeframe" },
              { value: "24/7", label: "Monitoring", sub: "Hourly readings" },
            ].map((stat, i) => (
              <div key={i} className="py-5 px-4 text-center">
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {stat.value}
                </p>
                <p className="text-sm font-medium mt-0.5">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERIMENT ── */}
      <section className="py-16 sm:py-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 gap-1.5 text-xs">
              <FlaskRound className="h-3 w-3" />
              Experiment
            </Badge>
            <h2 className="text-3xl font-bold mb-2">Two Tanks, One Question</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Same water, same sensors, same conditions. The only difference
              is one has seaweed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-8">
            <Card className="border-2 border-slate-200/80 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Droplets className="h-4.5 w-4.5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Control Tank</h3>
                    <p className="text-xs text-muted-foreground">
                      Baseline measurements
                    </p>
                  </div>
                </div>
                <Separator className="mb-4" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Saltwater only. Provides the baseline we compare the
                  experiment tank against.
                </p>
                <Badge
                  variant="outline"
                  className="text-xs text-slate-600 dark:text-slate-400"
                >
                  Water Only
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200/80 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <Leaf className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Experiment Tank</h3>
                    <p className="text-xs text-muted-foreground">
                      Biological CO2 absorption
                    </p>
                  </div>
                </div>
                <Separator className="mb-4" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Saltwater + 200g seaweed. The seaweed absorbs CO2 through
                  photosynthesis.
                </p>
                <Badge className="text-xs bg-emerald-600 hover:bg-emerald-700">
                  Active Experiment
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="h-4 w-4 text-cyan-500" />
                <h3 className="font-semibold text-sm">Sensors</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: TrendingDown, label: "CO2", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200/50 dark:border-red-800/30" },
                  { icon: Wind, label: "Oxygen", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20", border: "border-green-200/50 dark:border-green-800/30" },
                  { icon: Thermometer, label: "Temp", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200/50 dark:border-orange-800/30" },
                  { icon: Droplets, label: "Humidity", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200/50 dark:border-blue-800/30" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border ${s.border} ${s.bg}`}
                  >
                    <s.icon className={`h-4 w-4 ${s.color} shrink-0`} />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── NAVIGATION ── */}
      <section className="py-16 sm:py-20 bg-muted/20 border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">Explore Our Project</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Dive into the science, watch live data, or get in touch.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { href: "/experiment-design", icon: FlaskConical, title: "Experiment", desc: "Tanks, sensors, timeline, and methodology.", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/20", ring: "group-hover:ring-violet-200 dark:group-hover:ring-violet-800" },
                { href: "/innovation-project", icon: Microscope, title: "The Science", desc: "Why CO2 in oceans matters and how biology helps.", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20", ring: "group-hover:ring-purple-200 dark:group-hover:ring-purple-800" },
                { href: "/dashboard", icon: Activity, title: "Dashboard", desc: "Real-time sensor data from both tanks.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20", ring: "group-hover:ring-blue-200 dark:group-hover:ring-blue-800" },
                { href: "/updates", icon: Calendar, title: "Updates", desc: "Follow our experiment progress over time.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20", ring: "group-hover:ring-amber-200 dark:group-hover:ring-amber-800" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card
                    className={`h-full transition-all cursor-pointer group ring-1 ring-transparent ${item.ring} hover:shadow-md`}
                  >
                    <CardContent className="pt-5">
                      <div className={`p-2 rounded-lg ${item.bg} w-fit mb-3`}>
                        <item.icon className={`h-4.5 w-4.5 ${item.color}`} />
                      </div>
                      <h3 className="font-semibold text-sm mb-1 flex items-center gap-1">
                        {item.title}
                        <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-cyan-500 to-emerald-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-60" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-balance">
            See the Experiment in Action
          </h2>
          <p className="text-cyan-100 max-w-md mx-auto mb-6 text-sm">
            Watch real-time CO2, oxygen, temperature, and humidity readings
            from both tanks.
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 px-7 shadow-xl"
            >
              Open Live Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
