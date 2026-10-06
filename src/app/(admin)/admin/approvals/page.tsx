"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, User, Mail, MessageSquare } from "lucide-react";

interface SignupRequest {
  id: string;
  name: string;
  email: string;
  reason?: string;
  status: string;
  createdAt: string;
}

export default function ApprovalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/signup-requests")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          setRequests(
            Array.isArray(data)
              ? data.filter((r: SignupRequest) => r.status === "pending")
              : []
          );
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  async function postDecision(req: SignupRequest, action: "approve" | "deny", password?: string) {
    setWorkingId(req.id);
    setError("");
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: req.id, action, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to update request");
        return;
      }
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch {
      setError("Failed to update request");
    } finally {
      setWorkingId(null);
    }
  }

  function handleApprove(req: SignupRequest) {
    const password = window.prompt(
      `Set a password for the new admin account (${req.email}). It must be at least 6 characters.`
    );
    if (password === null) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    void postDecision(req, "approve", password);
  }

  function handleDeny(req: SignupRequest) {
    void postDecision(req, "deny");
  }

  if (status === "loading" || !session) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2 gap-1.5 text-xs border border-amber-200/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
            <CheckCircle className="h-3 w-3" />
            Approvals
          </Badge>
          <h1 className="text-3xl font-bold">Signup Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve pending admin requests
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="border-2 animate-pulse">
                <CardContent className="pt-5">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-5">
              <div className="text-center py-12">
                <CheckCircle className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-medium text-muted-foreground">
                  No pending requests
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  All signup requests have been reviewed.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id} className="border-2">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-semibold text-sm">
                          {req.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {req.email}
                        </span>
                      </div>
                      {req.reason && (
                        <div className="mb-2 rounded-md bg-muted/50 px-2.5 py-2">
                          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1">
                            <MessageSquare className="h-3 w-3" />
                            Reason
                          </span>
                          <p className="text-xs leading-snug text-foreground">
                            {req.reason}
                          </p>
                        </div>
                      )}
                      <Badge variant="outline" className="text-xs font-mono">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                        disabled={workingId === req.id}
                        onClick={() => handleApprove(req)}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        disabled={workingId === req.id}
                        onClick={() => handleDeny(req)}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Deny
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
