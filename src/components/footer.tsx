import Link from "next/link";
import { Beaker, Atom, Droplets } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg mb-3">
              <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-sm">
                <Beaker className="h-4 w-4" />
                <Atom className="h-2.5 w-2.5 absolute -top-0.5 -right-0.5 text-emerald-200" />
              </div>
              <span className="tracking-tight text-[15px]">
                <span className="text-cyan-600 dark:text-cyan-400">Billistic</span>{" "}
                <span className="text-emerald-600 dark:text-emerald-400">Beaniez</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              FIRST LEGO League team using biology to remove CO2 from ocean
              water. Science in motion.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-xs mb-3 uppercase tracking-wider text-muted-foreground">
              Project
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/experiment-design" className="text-muted-foreground hover:text-foreground transition-colors">
                Experiment Design
              </Link>
              <Link href="/innovation-project" className="text-muted-foreground hover:text-foreground transition-colors">
                Innovation Project
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Live Dashboard
              </Link>
              <Link href="/updates" className="text-muted-foreground hover:text-foreground transition-colors">
                Team Updates
              </Link>
              <Link href="/photo-log" className="text-muted-foreground hover:text-foreground transition-colors">
                Photo Log
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-xs mb-3 uppercase tracking-wider text-muted-foreground">
              Community
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/feedback" className="text-muted-foreground hover:text-foreground transition-colors">
                Feedback
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
              <Link href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                Admin Access
              </Link>
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Admin Login
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-xs mb-3 uppercase tracking-wider text-muted-foreground">
              Our Mission
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Using seaweed and phytoplankton to absorb CO2 from ocean water.
              One experiment at a time.
            </p>
            <p className="text-sm font-medium italic text-cyan-600 dark:text-cyan-400">
              &ldquo;CO2 Solutions, Seaweed Powered&rdquo;
            </p>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-medium">
              <span className="text-cyan-600 dark:text-cyan-400">Billistic</span>{" "}
              <span className="text-emerald-600 dark:text-emerald-400">Beaniez</span>
            </span>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5" />
            FLL Innovation Project
          </div>
        </div>
      </div>
    </footer>
  );
}
