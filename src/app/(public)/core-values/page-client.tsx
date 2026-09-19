"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/lib/use-content";
import {
  Compass,
  Lightbulb,
  Globe,
  Users,
  Heart,
  Smile,
  BookOpen,
  Rocket,
  Handshake,
  Sparkles,
  Target,
  GraduationCap,
} from "lucide-react";

export default function CoreValuesPage() {
  const { getContent } = useContent();
  const values = [
    {
      icon: Compass,
      title: "Discovery",
      description: "We explore new skills and ideas through hands on learning and curiosity driven exploration.",
      example: "We taught ourselves new programming techniques and researched ocean science topics beyond what was required for our project.",
      color: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-950/20",
      border: "border-cyan-200/50 dark:border-cyan-800/30",
      iconBg: "bg-cyan-50 dark:bg-cyan-950/20",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We use creative thinking to solve problems and develop unique solutions that make a difference.",
      example: "Our seaweed based CO2 absorption experiment combines biology with environmental science in an innovative approach to climate change.",
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "border-emerald-200/50 dark:border-emerald-800/30",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      icon: Globe,
      title: "Impact",
      description: "We apply what we learn to make our communities and the world a better place.",
      example: "Our project addresses real climate change challenges and we share our findings with local environmental groups.",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200/50 dark:border-blue-800/30",
      iconBg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: Users,
      title: "Inclusion",
      description: "We respect and welcome different perspectives, backgrounds, and abilities in our team.",
      example: "Every team member has an equal voice in decisions, and we make sure everyone understands each task before moving forward.",
      color: "text-violet-500",
      bg: "bg-violet-50 dark:bg-violet-950/20",
      border: "border-violet-200/50 dark:border-violet-800/30",
      iconBg: "bg-violet-50 dark:bg-violet-950/20",
    },
    {
      icon: Heart,
      title: "Teamwork",
      description: "We work together, share responsibilities, and support each other to achieve common goals.",
      example: "When our robot code had bugs, the whole team stayed late to debug together, with each person testing different solutions.",
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/20",
      border: "border-rose-200/50 dark:border-rose-800/30",
      iconBg: "bg-rose-50 dark:bg-rose-950/20",
    },
    {
      icon: Smile,
      title: "Fun",
      description: "We enjoy the journey, celebrate successes, and find joy in learning and building together.",
      example: "We have team pizza nights after competitions and create funny robot blooper reels from our testing sessions.",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      border: "border-amber-200/50 dark:border-amber-800/30",
      iconBg: "bg-amber-50 dark:bg-amber-950/20",
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 gap-1.5 px-4 py-1.5 border border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
          >
            <Heart className="h-3.5 w-3.5" />
            Core Values
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            {getContent("values.hero.title", "FLL Core Values")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            {getContent("values.hero.desc", "The principles that guide our team, shape our experience, and define who we are as people and learners.")}
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {values.map((value, i) => (
            <Card key={i} className={`border-2 ${value.border} overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={`w-16 h-16 p-3 rounded-xl ${value.iconBg} flex items-center justify-center mb-4 ring-4 ring-background`}>
                    <value.icon className={`h-7 w-7 ${value.color}`} />
                  </div>
                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {value.description}
                  </p>
                  {/* Example */}
                  <div className={`p-3 rounded-lg ${value.bg} w-full`}>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Sparkles className={`h-3 w-3 ${value.color}`} />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        How We Show It
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {value.example}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Closing Message */}
        <Card className="border-2 border-emerald-200/80 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/80 via-background to-teal-50/80 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/20">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold">{getContent("values.closing.title", "More Than Just Robots")}</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-base">
              <p>
                {getContent("values.closing.desc", "While FLL is about building robots and solving challenges, the Core Values remind us that how we work together matters just as much as what we build. These values shape us into better communicators, collaborators, and problem solvers.")}
              </p>
              <p>
                Every competition, every practice, and every team meeting is an opportunity to live these values and grow as individuals and as a team.
              </p>
            </div>
            <div className="mt-8 p-6 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/40 text-center">
              <p className="text-base font-medium text-emerald-700 dark:text-emerald-300">
                &quot;We do the work to find out what we don&apos;t know and discover what we need to learn.&quot;
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                FLL Core Values: Discovery
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
