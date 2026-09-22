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
import { Button } from "@/components/ui/button";
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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            {getContent("robot.hero.title", "Meet Our Robot")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
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

        {/* View Code */}
        <Card className="border-2 border-cyan-200/80 dark:border-cyan-800/50 mt-16 shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 inline-block mb-6">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-cyan-600 dark:text-cyan-400">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">View Our Code</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Our robot code is open source. Check out how we program Billistic Beaniez Bot to complete FLL competition missions.
            </p>
            <a
              href="https://github.com/billisticbeaniez/billistic-beaniez-code"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="gap-2 px-8 py-5 text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                View on GitHub
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
