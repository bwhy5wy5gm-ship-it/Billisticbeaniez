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

        {/* Attachments */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/20">
                <Wrench className="h-4.5 w-4.5 text-violet-500" />
              </div>
              <h2 className="text-xl font-semibold">{getContent("robot.attachments.title", "Attachments")}</h2>
            </div>
            {attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No attachments added yet. Add them in the admin Pages editor.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {attachments.map((att, i) => (
                  <div key={i} className="rounded-xl border bg-card overflow-hidden">
                    {att.image && (
                      <div className="aspect-[16/10] bg-muted overflow-hidden">
                        <img src={att.image} alt={att.title} className="h-full w-full object-contain bg-muted" />
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-semibold text-sm mb-1">{att.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{att.desc}</p>
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
