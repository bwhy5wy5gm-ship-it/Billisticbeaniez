"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, User, Mail } from "lucide-react";

interface SignupRequest {
  id: number;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function ApprovalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/signup-requests")
        .then((r) => r.json())
        .then((data) => {
          setRequests(data.requests || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  async function handleApprove(id: number) {
    await fetch(`/api/admin/signup-requests/${id}/approve`, { method: "POST" });
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleDeny(id: number) {
    await fetch(`/api/admin/signup-requests/${id}/deny`, { method: "POST" });
    setRequests((prev) => prev.filter((r) => r.id !== id));
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
                    <div>
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
                      <Badge variant="outline" className="text-xs font-mono">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApprove(req.id)}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => handleDeny(req.id)}
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
