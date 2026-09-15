"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Clock, User } from "lucide-react";

interface LogEntry {
  id: number;
  action: string;
  userId?: string;
  timestamp: string;
}

export default function LogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/logs")
        .then((r) => r.json())
        .then((data) => {
          setLogs(data.logs || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || !session) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2 gap-1.5 text-xs border border-cyan-200/60 dark:border-cyan-800/60 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300">
            <ScrollText className="h-3 w-3" />
            Logs
          </Badge>
          <h1 className="text-3xl font-bold">Access Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Recent activity and access history
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-2 animate-pulse">
                <CardContent className="pt-4">
                  <div className="h-3 bg-muted rounded w-2/3 mb-2" />
                  <div className="h-2 bg-muted rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-5">
              <div className="text-center py-12">
                <ScrollText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-medium text-muted-foreground">
                  No logs yet
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id} className="border-2">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.userId || "System"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString()}
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
