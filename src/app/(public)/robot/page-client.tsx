"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Wrench,
  Target,
  Zap,
  Gauge,
  FileImage,
  Plus,
  X,
  Rocket,
} from "lucide-react";
import { useContent } from "@/lib/use-content";

type Attachment = { image: string; title: string; desc: string };

export default function RobotPage() {
  const { getContent } = useContent();
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    const raw = getContent("robot.attachments", "");
    if (raw) {
      try { setAttachments(JSON.parse(raw)); } catch {}
    }
  }, [getContent("robot.attachments", "")]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 px-5 py-2 border border-cyan-200/60 dark:border-cyan-800/60 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 text-sm"
          >
            <Bot className="h-4 w-4" />
            Robot
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            {getContent("robot.hero.title", "Meet Our Robot")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
            {getContent("robot.hero.desc", "The engineering marvel that brings our ideas to life on the competition field.")}
          </p>
        </div>

        {/* Robot Photo */}
        {getContent("robot.image", "") && (
          <div className="mb-16 rounded-2xl overflow-hidden shadow-2xl border-2">
            <img src={getContent("robot.image", "")} alt="Robot" className="w-full h-auto object-contain bg-muted max-h-[500px]" />
          </div>
        )}

        {/* Robot Name */}
        <Card className="border-2 border-cyan-200/80 dark:border-cyan-800/50 mb-16 shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/20">
                <Bot className="h-6 w-6 text-cyan-500" />
              </div>
              <h2 className="text-2xl font-bold">{getContent("robot.name.title", "Robot Name")}</h2>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-cyan-50/80 to-cyan-100/50 dark:from-cyan-950/30 dark:to-cyan-900/20 border border-cyan-100 dark:border-cyan-900/30 text-center shadow-inner">
              <p className="text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 mb-4">
                {getContent("robot.name.value", "Tide Turner")}
              </p>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {getContent("robot.name.desc", "Inspired by our ocean science theme, Tide Turner represents our mission to turn the tide on climate change through innovative robotics and engineering.")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What the Robot Does */}
        <Card className="border-2 mb-16 shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20">
                <Target className="h-6 w-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold">{getContent("robot.whatis.title", "What It Does")}</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-10">
              <p className="text-lg">
                {getContent("robot.whatis.desc", "Tide Turner is designed to complete FLL competition missions with precision and reliability. The robot navigates the field autonomously, using a combination of sensors and pre-programmed routines to complete as many missions as possible within the 2.5 minute time limit.")}
              </p>
              <p className="text-lg">
                Our robot features a modular attachment system that allows us to quickly swap tools between missions, maximizing our score potential during competition.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
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
                  className="group p-6 rounded-2xl border bg-card text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-cyan-300 dark:hover:border-cyan-700"
                >
                  <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h4 className="font-bold text-base mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card className="border-2 shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20">
                <Wrench className="h-6 w-6 text-violet-500" />
              </div>
              <h2 className="text-2xl font-bold">{getContent("robot.attachments.title", "Attachments")}</h2>
            </div>
            {attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No attachments added yet. Add them in the admin Pages editor.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {attachments.map((att, i) => (
                  <div key={i} className="group rounded-2xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    {att.image && (
                      <div className="aspect-[16/10] bg-muted overflow-hidden">
                        <img src={att.image} alt={att.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-5">
                      <h4 className="font-bold text-base mb-2">{att.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{att.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
