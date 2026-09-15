"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Beaker, Atom, Lock, Mail, User, ArrowRight, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || "Failed to submit request");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/20 mb-4">
            <Beaker className="h-6 w-6" />
            <Atom className="h-3.5 w-3.5 absolute -mt-4 ml-4 text-emerald-200" />
          </div>
          <h1 className="text-2xl font-bold">Request Access</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit a request for admin access
          </p>
        </div>

        <Card className="border-2">
          <CardContent className="pt-6">
            {sent ? (
              <div className="text-center py-6">
                <div className="inline-flex p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/20 mb-4">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="font-semibold mb-2">Request Submitted</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  An admin will review your request. You&apos;ll receive an
                  email when approved.
                </p>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="gap-2">
                    Go to Login
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Name
                  </label>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-10"
                  />
                </div>
                {error && (
                  <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Request"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Already have access?{" "}
          <Link
            href="/login"
            className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
