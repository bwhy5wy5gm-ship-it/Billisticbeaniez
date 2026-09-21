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
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0">
          <div className="absolute -top-32 left-1/4 h-[600px] w-[600px] rounded-full bg-cyan-200/25 dark:bg-cyan-500/8 blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 h-[600px] w-[600px] rounded-full bg-emerald-200/25 dark:bg-emerald-500/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-blue-200/15 dark:bg-blue-500/5 blur-3xl" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 left-12 h-20 w-20 border border-cyan-300/20 dark:border-cyan-700/20 rounded-2xl rotate-12" />
          <div className="absolute top-24 right-16 h-14 w-14 border border-emerald-300/20 dark:border-emerald-700/20 rounded-full" />
          <div className="absolute bottom-16 left-1/3 h-10 w-10 border border-blue-300/20 dark:border-blue-700/20 rounded-lg -rotate-6" />
          <div className="absolute bottom-28 right-1/3 h-16 w-16 border border-purple-300/15 dark:border-purple-700/15 rounded-2xl rotate-45" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-36">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-8">
              {getContent("site.logo", "") ? (
                <img
                  src={getContent("site.logo", "")}
                  alt="Billistic Beaniez FIRST LEGO League robotics team logo"
                  className="h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-64 lg:w-64 rounded-3xl object-contain mx-auto drop-shadow-2xl"
                  style={{ transform: `rotate(${getContent("site.logo.rotate", "0")}deg)` }}
                />
              ) : (
                <div className="inline-flex items-center justify-center h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-64 lg:w-64 rounded-3xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-2xl shadow-cyan-500/30">
                  <Beaker className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28" />
                </div>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-extrabold mb-6 leading-[0.95] text-balance tracking-tight">
              {getContent("home.hero.title", "BILLISTIC BEANIEZ")}
            </h1>

            <p className="text-lg sm:text-lg md:text-2xl font-semibold text-muted-foreground mb-4 text-balance">
              {getContent("home.hero.subtitle", "Team #3818 | Perth, WA, Australia")}
            </p>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
              {getContent("home.hero.description", "We are Billistic Beaniez (Team #3818), a FIRST LEGO League team from Perth, WA that combines robotics, ocean science, and teamwork to tackle real world challenges.")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/innovation-project">
                <Button
                  size="lg"
                  className="gap-2 px-8 py-6 text-base shadow-lg shadow-cyan-500/15 hover:shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Microscope className="h-5 w-5" />
                  EXPLORE OUR PROJECT
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/robot">
                <Button size="lg" variant="outline" className="gap-2 px-8 py-6 text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Bot className="h-5 w-5" />
                  MEET OUR ROBOT
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 sm:py-24 bg-muted/20 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl sm:text-5xl font-bold mb-3">{getContent("home.whataido.title", "WHAT WE DO")}</h2>
              <p className="text-muted-foreground text-base max-w-lg mx-auto">
                {getContent("home.whataido.desc", "Three pillars that make up our FLL journey.")}
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
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
                    className={`h-full transition-all cursor-pointer group ring-1 ring-transparent ${item.ring} hover:shadow-md card-lift`}
                  >
                    <CardContent className="pt-8 pb-8 px-8">
                      <div className={`p-3.5 rounded-xl ${item.bg} w-fit mb-5`}>
                        <item.icon className={`h-6 w-6 ${item.color}`} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-1.5">
                        {item.title}
                        <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
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
      <section className="py-20 sm:py-24 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl sm:text-5xl font-bold mb-3">{getContent("home.explore.title", "EXPLORE MORE")}</h2>
              <p className="text-muted-foreground text-base max-w-lg mx-auto">
                {getContent("home.explore.desc", "Dive deeper into our project and team.")}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { href: "/updates", icon: Calendar, title: "Project Updates", desc: "Follow our progress.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
                { href: "/feedback", icon: MessageSquareText, title: "Innovation Feedback", desc: "What people are saying.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
                { href: "/photo-log", icon: Camera, title: "Photo Logs", desc: "See our journey visually.", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
                { href: "/dashboard", icon: Bot, title: "Live Dashboard", desc: "Watch real time data.", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="h-full transition-all cursor-pointer group hover:shadow-md hover:border-border/80 card-lift">
                    <CardContent className="pt-7 pb-7 px-7">
                      <div className={`p-3 rounded-xl ${item.bg} w-fit mb-4`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <h3 className="font-semibold text-sm mb-1.5 flex items-center gap-1.5">
                        {item.title}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
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
      <section className="py-20 sm:py-24 bg-muted/20 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-8">
            {/* Latest Update */}
            <div>
              <Badge variant="outline" className="mb-4 gap-1.5 text-xs">
                <Calendar className="h-3 w-3" />
                Latest Update
              </Badge>
              {latestUpdate ? (
                <Link href={`/updates/${latestUpdate.id}`}>
                  <Card className="border-2 hover:border-amber-200/80 dark:hover:border-amber-800/50 transition-all hover:shadow-sm cursor-pointer group h-full card-lift">
                    <CardContent className="pt-7 pb-7 px-7">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs font-mono mb-3">
                            {new Date(latestUpdate.date || latestUpdate.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Badge>
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {latestUpdate.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {latestUpdate.description.slice(0, 160)}
                            {latestUpdate.description.length > 160 ? "..." : ""}
                          </p>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-amber-500 transition-colors shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="border-2 border-dashed h-full">
                  <CardContent className="pt-7">
                    <div className="text-center py-10">
                      <Calendar className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No updates yet</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Featured Photo */}
            <div>
              <Badge variant="outline" className="mb-4 gap-1.5 text-xs">
                <Camera className="h-3 w-3" />
                Featured Moment
              </Badge>
              {featuredPhoto ? (
                <Link href={`/photo-log/${featuredPhoto.id}`}>
                  <Card className="border-2 hover:border-indigo-200/80 dark:hover:border-indigo-800/50 transition-all hover:shadow-sm cursor-pointer group overflow-hidden h-full card-lift">
                    <div className="aspect-[16/10] bg-muted overflow-hidden relative">
                      <img
                        src={featuredPhoto.photos[0]}
                        alt={featuredPhoto.title}
                        className="h-full w-full object-contain bg-muted group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="pt-5 pb-7 px-7">
                      <h3 className="font-semibold text-lg mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                  <CardContent className="pt-7">
                    <div className="text-center py-10">
                      <Camera className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No photos yet</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor */}
      <section className="py-20 sm:py-24 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
              Proudly Supported By
            </p>
            {getContent("site.sponsor.logo", "") ? (
              <a
                href={getContent("site.sponsor.url", "https://www.facebook.com/DNARacingWA/")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block group"
              >
                <img
                  src={getContent("site.sponsor.logo", "")}
                  alt="Sponsor"
                  className="h-24 sm:h-28 md:h-32 object-contain mx-auto mb-6 transition-transform duration-200 group-hover:scale-105"
                />
              </a>
            ) : (
              <div className="inline-flex items-center justify-center h-24 sm:h-28 md:h-32 w-48 rounded-xl border-2 border-dashed border-muted-foreground/20 mb-6">
                <span className="text-xs text-muted-foreground/50">Sponsor logo</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Thank you for supporting Billistic Beaniez and helping our team pursue robotics, engineering and STEM.
            </p>
            {getContent("site.sponsor.logo", "") && (
              <a
                href={getContent("site.sponsor.url", "https://www.facebook.com/DNARacingWA/")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                VISIT SPONSOR <ArrowRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-500 to-emerald-500" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA2KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-sm font-medium text-white/90">Billistic Beaniez</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 text-balance leading-tight">
              {getContent("home.cta.title", "Join Us on Our Journey")}
            </h2>
            <p className="text-cyan-100 max-w-lg mx-auto mb-10 text-base sm:text-lg leading-relaxed">
              {getContent("home.cta.desc", "Follow Billistic Beaniez as we build, learn, and compete in FIRST LEGO League.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="gap-2 px-10 py-6 text-base bg-white text-cyan-700 hover:bg-white/90 shadow-xl shadow-black/10 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {getContent("home.cta.button", "Get in Touch")}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/photo-log">
                <Button size="lg" variant="outline" className="gap-2 px-10 py-6 text-base bg-transparent border-white/30 text-white hover:bg-white/10 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Camera className="h-5 w-5" />
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
