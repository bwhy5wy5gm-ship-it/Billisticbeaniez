"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  FileCheck,
  ScrollText,
  Newspaper,
  MessageSquareText,
  Camera,
  ArrowRight,
  Shield,
  FileEdit,
  Clock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const sections = [
    {
      icon: FileCheck,
      title: "Approvals",
      desc: "Review pending admin signup requests",
      href: "/admin/approvals",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
    },
    {
      icon: Newspaper,
      title: "Updates",
      desc: "Create and manage project updates",
      href: "/admin/updates",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: MessageSquareText,
      title: "Feedback",
      desc: "Manage feedback received from others",
      href: "/admin/feedback",
      color: "text-pink-500",
      bg: "bg-pink-50 dark:bg-pink-950/20",
    },
    {
      icon: Camera,
      title: "Photo Log",
      desc: "Upload and manage project photos",
      href: "/admin/photo-log",
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-950/20",
    },
    {
      icon: FileEdit,
      title: "Pages",
      desc: "Edit content on all public pages",
      href: "/admin/pages",
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      icon: ScrollText,
      title: "Logs",
      desc: "View access logs and analytics",
      href: "/admin/logs",
      color: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-950/20",
    },
    {
      icon: Clock,
      title: "Team History",
      desc: "Manage past seasons and milestones",
      href: "/admin/history",
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/20",
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2 gap-1.5 text-xs border border-violet-200/60 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {session.user?.name || session.user?.email}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => (
            <Link key={s.href} href={s.href}>
              <Card className="border-2 hover:border-border/80 transition-all hover:shadow-sm cursor-pointer group h-full">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>
                        <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
                      </div>
                      <h3 className="font-semibold text-sm mb-1 flex items-center gap-1">
                        {s.title}
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
