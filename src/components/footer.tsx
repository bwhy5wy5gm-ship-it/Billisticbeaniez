"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Beaker, Atom } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useContent } from "@/lib/use-content";

export function Footer() {
  const { data: session } = useSession();
  const { getContent } = useContent();
  const logo = getContent("site.logo", "");

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg mb-3">
              {logo ? (
                <img src={logo} alt="Logo" className="h-12 w-12 rounded-lg object-contain shadow-sm" />
              ) : (
                <div className="relative flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-sm">
                  <Beaker className="h-6 w-6" />
                  <Atom className="h-3 w-3 absolute -top-0.5 -right-0.5 text-emerald-200" />
                </div>
              )}
              <span className="tracking-tight text-[15px]">
                <span className="text-cyan-600 dark:text-cyan-400">Billistic</span>{" "}
                <span className="text-emerald-600 dark:text-emerald-400">Beaniez</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are a community FIRST LEGO League team exploring STEM, engineering and innovative solutions to real-world problems.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-xs mb-3 uppercase tracking-wider text-muted-foreground">
              Project
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/robot" className="text-muted-foreground hover:text-foreground transition-colors">
                Robot
              </Link>
              <Link href="/innovation-project" className="text-muted-foreground hover:text-foreground transition-colors">
                Innovation Project
              </Link>
              <Link href="/core-values" className="text-muted-foreground hover:text-foreground transition-colors">
                Core Values
              </Link>
              <Link href="/team-history" className="text-muted-foreground hover:text-foreground transition-colors">
                History
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Live Dashboard
              </Link>
              <Link href="/updates" className="text-muted-foreground hover:text-foreground transition-colors">
                Project Updates
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-xs mb-3 uppercase tracking-wider text-muted-foreground">
              Photo Logs
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/photo-log/robot" className="text-muted-foreground hover:text-foreground transition-colors">
                Robot Photos
              </Link>
              <Link href="/photo-log/innovation" className="text-muted-foreground hover:text-foreground transition-colors">
                Innovation Photos
              </Link>
              <Link href="/photo-log/team" className="text-muted-foreground hover:text-foreground transition-colors">
                Team Photos
              </Link>
              <Link href="/photo-log/core-values" className="text-muted-foreground hover:text-foreground transition-colors">
                Core Values Photos
              </Link>
              <Link href="/photo-log/competition" className="text-muted-foreground hover:text-foreground transition-colors">
                Competition Photos
              </Link>
              <Link href="/photo-log" className="text-muted-foreground hover:text-foreground transition-colors">
                All Photos
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-xs mb-3 uppercase tracking-wider text-muted-foreground">
              Community
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/feedback" className="text-muted-foreground hover:text-foreground transition-colors">
                Innovation Feedback
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
              {session?.user && (session.user as any).isAdmin ? (
                <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Admin Dashboard
                </Link>
              ) : (
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Admin Login
                </Link>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-xs mb-3 uppercase tracking-wider text-muted-foreground">
              Our Mission
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Our mission is to learn, build, and innovate through teamwork.
              We use robotics and science to solve real problems and grow our
              skills. Together, we support each other and strive to make a
              positive impact.
            </p>
            <p className="text-sm font-medium italic text-cyan-600 dark:text-cyan-400">
              &ldquo;CO2 Solutions, Seaweed Powered&rdquo;
            </p>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            &copy; 2026{" "}
            <span className="font-medium">
              <span className="text-cyan-600 dark:text-cyan-400">Billistic</span>{" "}
              <span className="text-emerald-600 dark:text-emerald-400">Beaniez</span>
            </span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
