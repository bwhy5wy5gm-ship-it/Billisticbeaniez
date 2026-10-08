"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRound, KeyRound, History, Clock, Shield, CheckCircle2 } from "lucide-react";

const PRIMARY_ADMIN = "admin@billisticbeaniez.com";

interface LoginEntry {
  id: string;
  visitorId: string | null;
  userAgent: string | null;
  timestamp: string;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [logins, setLogins] = useState<LoginEntry[]>([]);
  const [loginsLoading, setLoginsLoading] = useState(true);

  const isPrimary = session?.user?.email === PRIMARY_ADMIN;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!isPrimary) return;
    fetch("/api/admin/logins")
      .then((r) => r.json())
      .then((data) => setLogins(data.logins || []))
      .catch(() => {})
      .finally(() => setLoginsLoading(false));
  }, [isPrimary]);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to change password." });
      } else {
        setMessage({ type: "success", text: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage({ type: "error", text: "Failed to change password." });
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || !session) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2 gap-1.5 text-xs border border-violet-200/60 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300">
            <UserRound className="h-3 w-3" />
            Account
          </Badge>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your profile and password{isPrimary ? " and login history" : ""}
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-2">
            <CardContent className="pt-5">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                Profile
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                  <p className="font-medium">{session.user?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="font-medium">{session.user?.email || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-5">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                Change password
              </h2>
              <form onSubmit={handlePassword} className="space-y-3 max-w-sm">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Current password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">New password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Confirm new password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-9"
                  />
                </div>
                {message && (
                  <div
                    className={`p-2.5 rounded-lg border text-xs ${
                      message.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30 text-red-600 dark:text-red-400"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {message.type === "success" && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                      {message.text}
                    </span>
                  </div>
                )}
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "Saving..." : "Change password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {isPrimary && (
            <Card className="border-2">
              <CardContent className="pt-5">
                <h2 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  Login history
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Who signed in to an admin account and when (last 100).
                </p>
                {loginsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : logins.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No logins recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {logins.map((entry) => {
                      const parts = (entry.userAgent || "").split(" · ");
                      const ip = parts[0] || "";
                      const device = parts.slice(1).join(" · ");
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between gap-3 rounded-lg border p-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {entry.visitorId || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {device || "Unknown device"}
                              {ip && <span className="font-mono"> · {ip}</span>}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                            <Clock className="h-3 w-3" />
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
