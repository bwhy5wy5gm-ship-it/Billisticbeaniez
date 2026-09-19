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
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "border-b bg-background/80 backdrop-blur-xl shadow-[0_1px_3px_0_rgb(0,0,0,0.04)]"
          : "border-b bg-background/60 backdrop-blur-sm"
      )}
    >
      <div className="container flex h-15 items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          {logo ? (
            <img src={logo} alt="Logo" className="h-14 w-14 rounded-xl object-contain shadow-md" />
          ) : (
            <div className="relative flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-md shadow-cyan-500/15 group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-200">
              <Beaker className="h-7 w-7" />
              <Atom className="h-3.5 w-3.5 absolute -top-0.5 -right-0.5 text-emerald-200" />
            </div>
          )}
          <span className="hidden sm:inline font-bold text-[15px] tracking-tight">
            <span className="text-cyan-600 dark:text-cyan-400">Billistic</span>{" "}
            <span className="text-emerald-600 dark:text-emerald-400">Beaniez</span>
          </span>
          <span className="sm:hidden font-bold tracking-tight">
            <span className="text-cyan-600 dark:text-cyan-400">B</span>
            <span className="text-emerald-600 dark:text-emerald-400">B</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center">
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
                    "px-3 h-8 text-[13px] font-medium rounded-lg transition-colors",
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4.5 w-4.5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-64 p-0">
              <div className="flex items-center gap-3 px-5 h-16 border-b">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
                ) : (
                  <div className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-white">
                    <Beaker className="h-5 w-5" />
                  </div>
                )}
                <span className="font-bold text-sm tracking-tight">
                  <span className="text-cyan-600">Billistic</span>{" "}
                  <span className="text-emerald-600">Beaniez</span>
                </span>
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
                          "w-full justify-start h-9 text-sm font-medium",
                          active && "bg-accent"
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
