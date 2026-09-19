"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { Beaker, Menu, Atom } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContent } from "@/lib/use-content";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/robot", label: "Robot" },
  { href: "/innovation-project", label: "Innovation" },
  { href: "/team-history", label: "History" },
  { href: "/core-values", label: "Values" },
  { href: "/updates", label: "Updates" },
  { href: "/feedback", label: "Feedback" },
  { href: "/photo-log", label: "Photos" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getContent } = useContent();
  const logo = getContent("site.logo", "");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-[0_1px_3px_0_rgb(0,0,0,0.04)] after:absolute after:inset-x-0 after:bottom-0 after:h-[1px] after:bg-gradient-to-r after:from-cyan-500/60 after:via-emerald-500/40 after:to-cyan-500/60"
          : "bg-background/60 backdrop-blur-sm after:absolute after:inset-x-0 after:bottom-0 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-muted/30 after:to-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          {logo ? (
            <img src={logo} alt="Logo" className="h-14 w-14 rounded-xl object-contain shadow-md group-hover:shadow-lg transition-shadow duration-200" />
          ) : (
            <div className="relative flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-md shadow-cyan-500/15 group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300 group-hover:scale-[1.03]">
              <Beaker className="h-7 w-7" />
              <Atom className="h-3.5 w-3.5 absolute -top-0.5 -right-0.5 text-emerald-200" />
            </div>
          )}
          <div className="hidden sm:flex flex-col leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] tracking-tight">
                <span className="text-cyan-600 dark:text-cyan-400">Billistic</span>{" "}
                <span className="text-emerald-600 dark:text-emerald-400">Beaniez</span>
              </span>
              <span className="inline-flex items-center rounded-md bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 ring-1 ring-inset ring-cyan-500/20">
                FLL Team
              </span>
            </div>
          </div>
          <span className="sm:hidden font-bold tracking-tight">
            <span className="text-cyan-600 dark:text-cyan-400">B</span>
            <span className="text-emerald-600 dark:text-emerald-400">B</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "relative px-3 h-8 text-[13px] font-medium rounded-lg transition-all duration-200",
                    active
                      ? "bg-accent text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" />
                  )}
                </Button>
              </Link>
            );
          })}
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-4.5 w-4.5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex items-center gap-3 px-5 h-16 border-b">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
                ) : (
                  <div className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-white">
                    <Beaker className="h-5 w-5" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight">
                    <span className="text-cyan-600">Billistic</span>{" "}
                    <span className="text-emerald-600">Beaniez</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    FLL Team
                  </span>
                </div>
              </div>
              <nav className="flex flex-col gap-0.5 p-3">
                {navLinks.map((link) => {
                  const active =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start h-10 text-sm font-medium rounded-lg transition-all duration-200",
                          active
                            ? "bg-accent text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
