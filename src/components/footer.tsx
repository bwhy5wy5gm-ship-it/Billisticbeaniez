"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Beaker, Atom } from "lucide-react";
import { useContent } from "@/lib/use-content";

export function Footer() {
  const { data: session } = useSession();
  const { getContent } = useContent();
  const logo = getContent("site.logo", "");
  const sponsorLogo = getContent("site.sponsor.logo", "");
  const sponsorUrl = getContent("site.sponsor.url", "https://www.facebook.com/DNARacingWA/");

  return (
    <footer className="relative border-t bg-muted/30">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center text-center mb-8">
          {logo ? (
            <img
              src={logo}
              alt="Billistic Beaniez Logo"
              className="h-24 w-24 rounded-2xl object-contain shadow-lg mb-6"
            />
          ) : (
            <div className="relative flex items-center justify-center h-24 w-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg mb-6">
              <Beaker className="h-12 w-12" />
              <Atom className="h-5 w-5 absolute -top-1 -right-1 text-emerald-200" />
            </div>
          )}
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            <span className="text-cyan-600 dark:text-cyan-400">Billistic</span>{" "}
            <span className="text-emerald-600 dark:text-emerald-400">Beaniez</span>
          </h2>
          <p className="text-sm text-muted-foreground/80">
            Robotics • Engineering • Innovation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-xs mb-4 uppercase tracking-wider text-muted-foreground">
              Project
            </h3>
            <div className="flex flex-col gap-3 text-sm">
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
            <h3 className="font-semibold text-xs mb-4 uppercase tracking-wider text-muted-foreground">
              Photo Logs
            </h3>
            <div className="flex flex-col gap-3 text-sm">
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
            <h3 className="font-semibold text-xs mb-4 uppercase tracking-wider text-muted-foreground">
              Community
            </h3>
            <div className="flex flex-col gap-3 text-sm">
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
            <h3 className="font-semibold text-xs mb-4 uppercase tracking-wider text-muted-foreground">
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

        {sponsorLogo && (
          <div className="border-t mt-8 pt-6 flex flex-col items-center gap-3 text-center">
            <p className="text-xs text-muted-foreground/60 uppercase tracking-wider">Proudly supported by</p>
            <a href={sponsorUrl} target="_blank" rel="noopener noreferrer">
              <img src={sponsorLogo} alt="Sponsor" className="h-10 object-contain rounded-md hover:opacity-80 transition-opacity" />
            </a>
          </div>
        )}

        <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
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
