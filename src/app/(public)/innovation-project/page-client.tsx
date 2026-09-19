"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Leaf,
  Droplets,
  Wind,
  Thermometer,
  Beaker,
  FlaskConical,
  Atom,
  Microscope,
  Waves,
  Zap,
  TreePine,
  BarChart3,
  Activity,
  Globe,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useContent } from "@/lib/use-content";

function FlowArrow() {
  return (
    <div className="flex justify-center py-4">
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/10 to-muted-foreground/30" />
        <ChevronDown className="h-5 w-5 text-muted-foreground/40" />
      </div>
    </div>
  );
}

export default function InnovationProjectPage() {
  const { getContent } = useContent();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 gap-1.5 px-4 py-1.5 border border-purple-200/60 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
          >
            <Microscope className="h-3.5 w-3.5" />
            Innovation
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            {getContent("innovation.hero.title", "Innovation Project")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            {getContent("innovation.hero.desc", "The research behind our experiment and why removing CO2 from ocean water matters for climate change.")}
          </p>
        </div>

        {/* Problem */}
        <Card className="border-2 mb-16 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20">
                <Globe className="h-5 w-5 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold">{getContent("innovation.problem.title", "The Problem")}</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {getContent("innovation.problem.desc", "Carbon dioxide (CO2) levels in Earth&apos;s atmosphere are rising, causing global temperatures to increase. Oceans absorb about 30% of the CO2 we release, but this comes at a cost: dissolved CO2 makes ocean water more acidic, harming marine ecosystems.|||We need cost effective, nature based solutions to reduce the amount of CO2 dissolved in ocean water before it causes further damage to coral reefs, shellfish, and marine food chains.").split("|||").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <FlowArrow />

        {/* Hypothesis */}
        <Card className="border-2 border-cyan-200/80 dark:border-cyan-800/50 mb-16 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/20">
                <Zap className="h-5 w-5 text-cyan-500" />
              </div>
              <h2 className="text-2xl font-semibold">{getContent("innovation.hypothesis.title", "Our Hypothesis")}</h2>
            </div>
            <div className="p-6 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/30">
              <p className="text-muted-foreground leading-relaxed">
                {getContent("innovation.hypothesis.desc", "If we add seaweed and phytoplankton to saltwater, then the dissolved CO2 level will decrease significantly compared to a control tank, because these organisms absorb CO2 through photosynthesis.")}
              </p>
            </div>
          </CardContent>
        </Card>

        <FlowArrow />

        {/* Solution */}
        <Card className="border-2 border-emerald-200/80 dark:border-emerald-800/50 mb-16 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20">
                <Leaf className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold">{getContent("innovation.solution.title", "Our Solution")}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {getContent("innovation.solution.desc", "We use seaweed (a natural photosynthesizer) to absorb dissolved CO2 from ocean water in a controlled, measurable setup.")}
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Beaker,
                  title: "Identify Species",
                  desc: "Choose the best seaweed/phytoplankton for CO2 absorption",
                  color: "text-cyan-500",
                  bg: "bg-cyan-50 dark:bg-cyan-950/20",
                },
                {
                  icon: FlaskConical,
                  title: "Controlled Test",
                  desc: "Compare with a control tank over 14 days",
                  color: "text-blue-500",
                  bg: "bg-blue-50 dark:bg-blue-950/20",
                },
                {
                  icon: BarChart3,
                  title: "Measure Results",
                  desc: "Track CO2, O2, temperature, and humidity levels",
                  color: "text-emerald-500",
                  bg: "bg-emerald-50 dark:bg-emerald-950/20",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl border bg-card text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`inline-flex p-3 rounded-xl ${step.bg} mb-4`}>
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <FlowArrow />

        {/* Science Explanation */}
        <Card className="border-2 mb-16 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                <Atom className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold">{getContent("innovation.science.title", "How Photosynthesis Helps")}</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {getContent("innovation.science.desc", "Seaweed and phytoplankton perform photosynthesis just like land plants. They absorb dissolved CO2 from the water and use sunlight to produce energy and release oxygen.|||By placing seaweed in a sealed tank of saltwater, we can measure exactly how much CO2 is removed by comparing it with a control tank that has no seaweed. If the experiment tank shows lower CO2 and higher oxygen levels, our hypothesis is supported.").split("|||").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <FlowArrow />

        {/* Experiment Setup */}
        <Card className="border-2 border-violet-200/80 dark:border-violet-800/50 mb-16 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20">
                <FlaskConical className="h-5 w-5 text-violet-500" />
              </div>
              <h2 className="text-2xl font-semibold">{getContent("innovation.setup.title", "Experiment Setup")}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30">
                <h4 className="font-semibold mb-3">Control Tank</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full bg-violet-500 shrink-0" /> Saltwater only</li>
                  <li className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full bg-violet-500 shrink-0" /> No biological additions</li>
                  <li className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full bg-violet-500 shrink-0" /> Same tank size as experiment</li>
                  <li className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full bg-violet-500 shrink-0" /> Same lighting conditions</li>
                </ul>
              </div>
              <div className="p-6 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <h4 className="font-semibold mb-3">Experiment Tank</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" /> Saltwater with seaweed</li>
                  <li className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" /> Phytoplankton added</li>
                  <li className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" /> Same tank size as control</li>
                  <li className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" /> Same lighting conditions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <FlowArrow />

        {/* Sensor List */}
        <Card className="border-2 border-amber-200/80 dark:border-amber-800/50 mb-16 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20">
                <Activity className="h-5 w-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-semibold">{getContent("innovation.sensors.title", "Sensors Used")}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Droplets, name: "CO2 Sensor", desc: "Measures dissolved carbon dioxide levels in parts per million", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200/50 dark:border-red-800/30" },
                { icon: Wind, name: "Oxygen Sensor", desc: "Tracks dissolved oxygen concentration for photosynthesis measurement", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200/50 dark:border-blue-800/30" },
                { icon: Thermometer, name: "Temperature Sensor", desc: "Monitors water temperature to ensure consistent conditions", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200/50 dark:border-orange-800/30" },
                { icon: Waves, name: "Humidity Sensor", desc: "Measures air humidity above the water surface in each tank", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/20", border: "border-cyan-200/50 dark:border-cyan-800/30" },
              ].map((sensor, i) => (
                <div key={i} className={`p-6 rounded-xl border ${sensor.border} ${sensor.bg} hover:shadow-md hover:-translate-y-1 transition-all duration-300`}>
                  <div className="flex items-center gap-3 mb-3">
                    <sensor.icon className={`h-5 w-5 ${sensor.color}`} />
                    <h4 className="font-semibold">{sensor.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{sensor.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <FlowArrow />

        {/* Results Summary */}
        <Card className="border-2 border-cyan-200/80 dark:border-cyan-800/50 mb-16 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-50 dark:from-cyan-950/30 dark:via-blue-950/20 dark:to-cyan-950/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                <BarChart3 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h2 className="text-2xl font-semibold">{getContent("innovation.results.title", "Results Summary")}</h2>
            </div>
            <div className="p-6 rounded-xl bg-white/60 dark:bg-background/40 border border-cyan-200/50 dark:border-cyan-800/30 text-center backdrop-blur-sm">
              <p className="text-muted-foreground leading-relaxed">
                Visit the <span className="font-medium text-foreground">Dashboard</span> to see
                live sensor data and charts comparing the control and experiment
                tanks over the 14 day period.
              </p>
            </div>
          </div>
        </Card>

        <FlowArrow />

        {/* Why It Matters */}
        <Card className="border-2 mb-16 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20">
                <Heart className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold">{getContent("innovation.impact.title", "Why It Matters")}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Climate Action", desc: "Reducing CO2 in oceans helps slow ocean acidification and protects marine life.", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/20", border: "border-cyan-200/50 dark:border-cyan-800/30" },
                { title: "Low Cost Solution", desc: "Seaweed is cheap, renewable, and grows quickly, making this scalable.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200/50 dark:border-emerald-800/30" },
                { title: "Marine Ecosystem Health", desc: "Healthier oceans mean healthier food chains and more biodiversity.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200/50 dark:border-blue-800/30" },
                { title: "Inspiring Future Scientists", desc: "This project proves young people can contribute real solutions to climate change.", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/20", border: "border-violet-200/50 dark:border-violet-800/30" },
              ].map((item, i) => (
                <div key={i} className={`p-6 rounded-xl border ${item.border} ${item.bg} hover:shadow-md hover:-translate-y-1 transition-all duration-300`}>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <FlowArrow />

        {/* Future Improvements */}
        <Card className="border-2 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20">
                <Leaf className="h-5 w-5 text-violet-500" />
              </div>
              <h2 className="text-2xl font-semibold">{getContent("innovation.future.title", "Future Improvements")}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "More Species", desc: "Test different types of seaweed and phytoplankton to find the most effective CO2 absorber.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200/50 dark:border-emerald-800/30" },
                { title: "Longer Timeframe", desc: "Run the experiment for 30 days instead of 14 to capture longer term trends.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200/50 dark:border-blue-800/30" },
                { title: "Larger Tanks", desc: "Scale up to larger tanks to test if the results hold at bigger volumes.", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/20", border: "border-cyan-200/50 dark:border-cyan-800/30" },
                { title: "Community Sharing", desc: "Share our findings with local environmental groups and schools.", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20", border: "border-rose-200/50 dark:border-rose-800/30" },
              ].map((item, i) => (
                <div key={i} className={`p-6 rounded-xl border ${item.border} ${item.bg} hover:shadow-md hover:-translate-y-1 transition-all duration-300`}>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
