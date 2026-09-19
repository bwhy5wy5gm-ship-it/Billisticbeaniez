"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Microscope,
  Heart,
  Calendar,
  MessageSquareText,
  Camera,
  ArrowRight,
  ArrowUpRight,
  Beaker,
  Atom,
  Trophy,
  Star,
} from "lucide-react";
import { useContent } from "@/lib/use-content";

export default function HomePage() {
  const { getContent } = useContent();
  const [mounted, setMounted] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState<any>(null);
  const [featuredPhoto, setFeaturedPhoto] = useState<any>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetch("/api/updates")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLatestUpdate({ ...data[0], photos: data[0].photos || [] });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const withPhotos = data.filter((p: any) => p.photos && p.photos.length > 0);
          if (withPhotos.length > 0) {
            const random = withPhotos[Math.floor(Math.random() * withPhotos.length)];
            setFeaturedPhoto({ ...random, photos: random.photos || [] });
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className={mounted ? "animate-in" : "opacity-0"}>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50/40 to-emerald-50 dark:from-cyan-950/20 dark:via-blue-950/10 dark:to-emerald-950/20" />
        <div className="absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-200/20 dark:bg-cyan-500/5 blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-200/20 dark:bg-emerald-500/5 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo Placeholder */}
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/20 mb-6">
              {getContent("site.logo", "") ? (
                <img src={getContent("site.logo", "")} alt="Logo" className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <>
                  <Beaker className="h-9 w-9" />
                  <Atom className="h-4 w-4 absolute -mt-5 ml-5 text-emerald-200" />
                </>
              )}
            </div>

            <div className="inline-flex items-center gap-2 mb-6">
              <Badge
                variant="secondary"
                className="px-4 py-1.5 text-sm gap-2 border border-cyan-200/60 dark:border-cyan-800/50 bg-white/70 dark:bg-cyan-950/30 backdrop-blur-sm"
              >
                <span className="font-semibold">
                  <span className="text-cyan-600 dark:text-cyan-400">Billistic</span>{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">Beaniez</span>
                </span>
                <span className="text-muted-foreground/40">|</span>
                FLL Team
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold mb-5 leading-[1.12] text-balance">
              {getContent("home.hero.title", "Billistic Beaniez — Robotics & STEM")}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed text-balance">
              {getContent("home.hero.description", "We are Billistic Beaniez, a FIRST LEGO League team that combines robotics, ocean science, and teamwork to tackle real world challenges.")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/innovation-project">
                <Button
                  size="lg"
                  className="gap-2 px-6 shadow-lg shadow-cyan-500/15 hover:shadow-cyan-500/25 transition-shadow"
                >
                  <Microscope className="h-4 w-4" />
                  {getContent("home.hero.button1", "See Our Innovation")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/robot">
                <Button size="lg" variant="outline" className="gap-2 px-6">
                  <Bot className="h-4 w-4" />
                  {getContent("home.hero.button2", "See Our Robot")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 sm:py-20 bg-muted/20 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">{getContent("home.whataido.title", "What We Do")}</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {getContent("home.whataido.desc", "Three pillars that make up our FLL journey.")}
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  href: "/robot",
                  icon: Bot,
                  title: getContent("home.whataido.robot.title", "Robot"),
                  desc: getContent("home.whataido.robot.desc", "We design, build, and program a LEGO robot to complete autonomous missions on the competition field."),
                  color: "text-cyan-500",
                  bg: "bg-cyan-50 dark:bg-cyan-950/20",
                  ring: "group-hover:ring-cyan-200 dark:group-hover:ring-cyan-800",
                },
                {
                  href: "/innovation-project",
                  icon: Microscope,
                  title: getContent("home.whataido.innovation.title", "Innovation"),
                  desc: getContent("home.whataido.innovation.desc", "We research real world problems and develop creative solutions. Our current project uses seaweed to remove CO2 from ocean water."),
                  color: "text-purple-500",
                  bg: "bg-purple-50 dark:bg-purple-950/20",
                  ring: "group-hover:ring-purple-200 dark:group-hover:ring-purple-800",
                },
                {
                  href: "/core-values",
                  icon: Heart,
                  title: getContent("home.whataido.values.title", "Team Values"),
                  desc: getContent("home.whataido.values.desc", "We practice discovery, inclusion, teamwork, and fun while learning to work together and make a positive impact."),
                  color: "text-rose-500",
                  bg: "bg-rose-50 dark:bg-rose-950/20",
                  ring: "group-hover:ring-rose-200 dark:group-hover:ring-rose-800",
                },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card
                    className={`h-full transition-all cursor-pointer group ring-1 ring-transparent ${item.ring} hover:shadow-md`}
                  >
                    <CardContent className="pt-6">
                      <div className={`p-2.5 rounded-lg ${item.bg} w-fit mb-4`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <h3 className="font-semibold mb-2 flex items-center gap-1">
                        {item.title}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
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

      {/* Quick Links */}
      <section className="py-16 sm:py-20 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">{getContent("home.explore.title", "Explore More")}</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {getContent("home.explore.desc", "Dive deeper into our project and team.")}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { href: "/updates", icon: Calendar, title: "Project Updates", desc: "Follow our progress.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
                { href: "/feedback", icon: MessageSquareText, title: "Innovation Feedback", desc: "What people are saying.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
                { href: "/photo-log", icon: Camera, title: "Photo Logs", desc: "See our journey visually.", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
                { href: "/dashboard", icon: Trophy, title: "Live Dashboard", desc: "Watch real time data.", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="h-full transition-all cursor-pointer group hover:shadow-md hover:border-border/80">
                    <CardContent className="pt-5">
                      <div className={`p-2 rounded-lg ${item.bg} w-fit mb-3`}>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
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

      {/* Latest Update + Featured Photo side by side */}
      <section className="py-16 sm:py-20 bg-muted/20 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
            {/* Latest Update */}
            <div>
              <Badge variant="outline" className="mb-3 gap-1.5 text-xs">
                <Calendar className="h-3 w-3" />
                Latest Update
              </Badge>
              {latestUpdate ? (
                <Link href={`/updates/${latestUpdate.id}`}>
                  <Card className="border-2 hover:border-amber-200/80 dark:hover:border-amber-800/50 transition-all hover:shadow-sm cursor-pointer group h-full">
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs font-mono mb-2">
                            {new Date(latestUpdate.date || latestUpdate.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Badge>
                          <h3 className="font-semibold mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {latestUpdate.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {latestUpdate.description.slice(0, 160)}
                            {latestUpdate.description.length > 160 ? "..." : ""}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-amber-500 transition-colors shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="border-2 border-dashed h-full">
                  <CardContent className="pt-5">
                    <div className="text-center py-8">
                      <Calendar className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No updates yet</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Featured Photo */}
            <div>
              <Badge variant="outline" className="mb-3 gap-1.5 text-xs">
                <Camera className="h-3 w-3" />
                Featured Moment
              </Badge>
              {featuredPhoto ? (
                <Link href={`/photo-log/${featuredPhoto.id}`}>
                  <Card className="border-2 hover:border-indigo-200/80 dark:hover:border-indigo-800/50 transition-all hover:shadow-sm cursor-pointer group overflow-hidden h-full">
                    <div className="aspect-[16/10] bg-muted overflow-hidden relative">
                      <img
                        src={featuredPhoto.photos[0]}
                        alt={featuredPhoto.title}
                        className="h-full w-full object-contain bg-muted group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {featuredPhoto.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {featuredPhoto.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="border-2 border-dashed h-full">
                  <CardContent className="pt-5">
                    <div className="text-center py-8">
                      <Camera className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No photos yet</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-500 to-emerald-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA2KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-sm font-medium text-white/90">Billistic Beaniez</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance leading-tight">
              {getContent("home.cta.title", "Join Us on Our Journey")}
            </h2>
            <p className="text-cyan-100 max-w-lg mx-auto mb-8 text-sm sm:text-base leading-relaxed">
              {getContent("home.cta.desc", "Follow Billistic Beaniez as we build, learn, and compete in FIRST LEGO League.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <Button size="lg" className="gap-2 px-8 bg-white text-cyan-700 hover:bg-white/90 shadow-xl shadow-black/10 font-semibold">
                  {getContent("home.cta.button", "Get in Touch")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/photo-log">
                <Button size="lg" variant="outline" className="gap-2 px-8 bg-transparent border-white/30 text-white hover:bg-white/10 font-semibold">
                  <Camera className="h-4 w-4" />
                  View Photos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
