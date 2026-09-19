"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/lib/use-content";
import {
  Users,
  Heart,
  Star,
  Zap,
  Wrench,
  Code,
  Megaphone,
  BarChart3,
  Camera,
} from "lucide-react";

export default function TeamPage() {
  const { getContent } = useContent();
  const teamMembers = [
    {
      name: "Alex Chen",
      role: "Team Captain & Lead Programmer",
      funFact: "Can solve a Rubik's cube in under 2 minutes",
      contribution: "Writes the core robot navigation code and coordinates team meetings.",
      color: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-950/20",
      border: "border-cyan-200/50 dark:border-cyan-800/30",
      icon: Code,
    },
    {
      name: "Jordan Rivera",
      role: "Robot Design Lead",
      funFact: "Builds LEGO sets with over 5,000 pieces",
      contribution: "Designed the modular attachment system and built the robot frame.",
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "border-emerald-200/50 dark:border-emerald-800/30",
      icon: Zap,
    },
    {
      name: "Sam Patel",
      role: "Research & Presentation Lead",
      funFact: "Has visited 3 different ocean research labs",
      contribution: "Researched the science behind CO2 absorption and built our presentation.",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200/50 dark:border-blue-800/30",
      icon: Megaphone,
    },
    {
      name: "Taylor Kim",
      role: "Data Analyst",
      funFact: "Created a spreadsheet to track pizza consumption",
      contribution: "Manages sensor data collection and creates charts for our results.",
      color: "text-violet-500",
      bg: "bg-violet-50 dark:bg-violet-950/20",
      border: "border-violet-200/50 dark:border-violet-800/30",
      icon: BarChart3,
    },
    {
      name: "Casey Morgan",
      role: "Builder & Mechanic",
      funFact: "Can identify any LEGO piece by touch alone",
      contribution: "Builds and repairs the robot, ensures all mechanisms work reliably.",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      border: "border-amber-200/50 dark:border-amber-800/30",
      icon: Wrench,
    },
    {
      name: "Riley Johnson",
      role: "Documentation & Media",
      funFact: "Runs a robotics YouTube channel with 1,000 subscribers",
      contribution: "Documents our progress with photos, videos, and team updates.",
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/20",
      border: "border-rose-200/50 dark:border-rose-800/30",
      icon: Camera,
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
            <Users className="h-3.5 w-3.5" />
            Our Team
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {getContent("team.hero.title", "Meet the Team")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            {getContent("team.hero.desc", "Six passionate students working together to solve real world problems through robotics and innovation.")}
          </p>
        </div>

        {/* Team Photo Placeholder */}
        <Card className="border-2 border-emerald-200/80 dark:border-emerald-800/50 mb-12">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <Camera className="h-4.5 w-4.5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold">{getContent("team.photo.title", "Team Photo")}</h2>
            </div>
            <div className="aspect-[16/9] bg-muted rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Team photo coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {teamMembers.map((member, i) => (
            <Card key={i} className={`border-2 ${member.border} overflow-hidden`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-full ${member.bg} flex items-center justify-center mb-4 ring-4 ring-background`}>
                    <member.icon className={`h-8 w-8 ${member.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                  <Badge variant="outline" className="text-xs mb-3">
                    {member.role}
                  </Badge>
                  <div className="p-3 rounded-lg bg-muted/50 w-full mb-2">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Star className="h-3 w-3 text-amber-500" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Fun Fact
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.funFact}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${member.bg} w-full`}>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Heart className={`h-3 w-3 ${member.color}`} />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Contribution
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {member.contribution}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
