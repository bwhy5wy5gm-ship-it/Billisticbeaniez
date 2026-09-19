"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Cpu,
  Wrench,
  Target,
  Lightbulb,
  Zap,
  Gauge,
  Settings,
  Code,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import { useContent } from "@/lib/use-content";

export default function RobotPage() {
  const { getContent } = useContent();
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 gap-1.5 px-4 py-1.5 border border-cyan-200/60 dark:border-cyan-800/60 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
          >
            <Bot className="h-3.5 w-3.5" />
            Robot
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {getContent("robot.hero.title", "Meet Our Robot")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            {getContent("robot.hero.desc", "The engineering marvel that brings our ideas to life on the competition field.")}
          </p>
        </div>

        {/* Robot Photo */}
        {getContent("robot.image", "") && (
          <div className="mb-10 rounded-2xl overflow-hidden border-2">
            <img src={getContent("robot.image", "")} alt="Robot" className="w-full h-auto object-contain bg-muted max-h-[400px]" />
          </div>
        )}

        {/* Robot Name */}
        <Card className="border-2 border-cyan-200/80 dark:border-cyan-800/50 mb-10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/20">
                <Bot className="h-4.5 w-4.5 text-cyan-500" />
              </div>
              <h2 className="text-xl font-semibold">{getContent("robot.name.title", "Robot Name")}</h2>
            </div>
            <div className="p-5 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/30 text-center">
              <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                {getContent("robot.name.value", "Tide Turner")}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {getContent("robot.name.desc", "Inspired by our ocean science theme, Tide Turner represents our mission to turn the tide on climate change through innovative robotics and engineering.")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What the Robot Does */}
        <Card className="border-2 mb-10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <Target className="h-4.5 w-4.5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold">{getContent("robot.whatis.title", "What It Does")}</h2>
            </div>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                {getContent("robot.whatis.desc", "Tide Turner is designed to complete FLL competition missions with precision and reliability. The robot navigates the field autonomously, using a combination of sensors and pre-programmed routines to complete as many missions as possible within the 2.5 minute time limit.")}
              </p>
              <p>
                Our robot features a modular attachment system that allows us to quickly swap tools between missions, maximizing our score potential during competition.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              {[
                {
                  icon: Gauge,
                  title: "Precision Movement",
                  desc: "Accurate navigation using color and distance sensors",
                  color: "text-cyan-500",
                  bg: "bg-cyan-50 dark:bg-cyan-950/20",
                },
                {
                  icon: Wrench,
                  title: "Modular Design",
                  desc: "Quick swap attachments for different mission requirements",
                  color: "text-emerald-500",
                  bg: "bg-emerald-50 dark:bg-emerald-950/20",
                },
                {
                  icon: Zap,
                  title: "Speed Optimization",
                  desc: "Balanced approach between speed and accuracy",
                  color: "text-blue-500",
                  bg: "bg-blue-50 dark:bg-blue-950/20",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border bg-card text-center"
                >
                  <div className={`inline-flex p-2.5 rounded-lg ${feature.bg} mb-3`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Programming Highlights */}
        <Card className="border-2 border-emerald-200/80 dark:border-emerald-800/50 mb-10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <Code className="h-4.5 w-4.5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold">{getContent("robot.programming.title", "Programming Highlights")}</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: Cpu,
                  title: "LEGO MINDSTORMS EV3",
                  desc: "Our robot runs on the EV3 platform, programmed using EV3 MicroPython for precise control and advanced logic.",
                  color: "text-emerald-500",
                  bg: "bg-emerald-50 dark:bg-emerald-950/20",
                },
                {
                  icon: Settings,
                  title: "PID Control System",
                  desc: "We implemented a PID controller for smooth, accurate line following and wall squaring movements.",
                  color: "text-cyan-500",
                  bg: "bg-cyan-50 dark:bg-cyan-950/20",
                },
                {
                  icon: RotateCcw,
                  title: "Calibration Routines",
                  desc: "Automatic sensor calibration at the start of each run ensures consistent performance under different lighting conditions.",
                  color: "text-blue-500",
                  bg: "bg-blue-50 dark:bg-blue-950/20",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${item.color === "text-emerald-500" ? "border-emerald-200/50 dark:border-emerald-800/30" : item.color === "text-cyan-500" ? "border-cyan-200/50 dark:border-cyan-800/30" : "border-blue-200/50 dark:border-blue-800/30"} ${item.bg}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Challenges and Improvements */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/20">
                <Lightbulb className="h-4.5 w-4.5 text-violet-500" />
              </div>
              <h2 className="text-xl font-semibold">{getContent("robot.challenges.title", "Challenges & Improvements")}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Sensor Reliability",
                  desc: "Early prototypes struggled with inconsistent sensor readings. We solved this by implementing multiple calibration runs and averaging algorithms.",
                  color: "text-cyan-500",
                  bg: "bg-cyan-50 dark:bg-cyan-950/20",
                  border: "border-cyan-200/50 dark:border-cyan-800/30",
                },
                {
                  title: "Attachment Alignment",
                  desc: "Ensuring attachments connect securely and align properly required redesigning the mounting mechanism with guide pins and snap fits.",
                  color: "text-emerald-500",
                  bg: "bg-emerald-50 dark:bg-emerald-950/20",
                  border: "border-emerald-200/50 dark:border-emerald-800/30",
                },
                {
                  title: "Time Management",
                  desc: "Balancing mission complexity with time constraints taught us to prioritize high value missions and optimize our run sequences.",
                  color: "text-blue-500",
                  bg: "bg-blue-50 dark:bg-blue-950/20",
                  border: "border-blue-200/50 dark:border-blue-800/30",
                },
                {
                  title: "Future Upgrades",
                  desc: "We plan to add machine learning capabilities for adaptive navigation and improved decision making during missions.",
                  color: "text-violet-500",
                  bg: "bg-violet-50 dark:bg-violet-950/20",
                  border: "border-violet-200/50 dark:border-violet-800/30",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${item.border} ${item.bg}`}
                >
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
