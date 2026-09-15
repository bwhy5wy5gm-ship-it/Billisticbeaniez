"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, CheckCircle } from "lucide-react";

const defaultFields = [
  { key: "site_name", label: "Site Name", placeholder: "Billistic Beaniez FLL Project" },
  { key: "team_name", label: "Team Name", placeholder: "Billistic Beaniez" },
  { key: "project_title", label: "Project Title", placeholder: "CO2 Removal from Ocean Water" },
  { key: "tagline", label: "Tagline", placeholder: "CO2 Solutions, Seaweed Powered" },
  { key: "contact_email", label: "Contact Email", placeholder: "aarik.berge@gmail.com" },
  { key: "about", label: "About the Team", placeholder: "Tell people about your team...", multiline: true },
  { key: "experiment_summary", label: "Experiment Summary", placeholder: "Brief summary of the experiment...", multiline: true },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/settings")
        .then((r) => r.json())
        .then((data) => setSettings(data.settings || {}))
        .catch(() => {});
    }
  }, [session]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  function updateField(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  if (status === "loading" || !session) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="secondary" className="mb-2 gap-1.5 text-xs border border-violet-200/60 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300">
              <Settings className="h-3 w-3" />
              Settings
            </Badge>
            <h1 className="text-3xl font-bold">Site Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your project site content
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saved ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save All"}
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {defaultFields.map((field) => (
            <Card key={field.key} className="border-2">
              <CardContent className="pt-5">
                <label className="text-sm font-medium mb-1.5 block">
                  {field.label}
                </label>
                {field.multiline ? (
                  <Textarea
                    value={settings[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="resize-none"
                  />
                ) : (
                  <Input
                    value={settings[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="h-10"
                  />
                )}
              </CardContent>
            </Card>
          ))}

          {Object.entries(settings)
            .filter(([key]) => !defaultFields.find((f) => f.key === key))
            .map(([key, value]) => (
              <Card key={key} className="border-2">
                <CardContent className="pt-5">
                  <label className="text-sm font-medium mb-1.5 block capitalize">
                    {key.replace(/_/g, " ")}
                  </label>
                  <Input
                    value={value}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="h-10"
                  />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
