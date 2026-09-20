"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, CheckCircle, Eye, Pencil, ImagePlus, X, Beaker, Atom, Plus } from "lucide-react";
import { invalidateContent } from "@/lib/use-content";

type Field = { key: string; label: string; multiline?: boolean; type?: "text" | "image" | "attachments" };

const PAGES: { id: string; label: string; route: string; fields: Field[] }[] = [
  {
    id: "home",
    label: "Home",
    route: "/",
    fields: [
      { key: "site.logo", label: "Site Logo", type: "image" },
      { key: "site.favicon", label: "Favicon (PNG)", type: "image" },
      { key: "home.hero.title", label: "Hero Title" },
      { key: "home.hero.subtitle", label: "Hero Subtitle" },
      { key: "home.hero.description", label: "Hero Description", multiline: true },
      { key: "home.hero.image", label: "Hero Image", type: "image" },
      { key: "home.hero.button1", label: "Button 1" },
      { key: "home.hero.button2", label: "Button 2" },
      { key: "home.whataido.title", label: "What We Do Title" },
      { key: "home.whataido.desc", label: "What We Do Description", multiline: true },
      { key: "home.whataido.robot.title", label: "Robot Card Title" },
      { key: "home.whataido.robot.desc", label: "Robot Card Description", multiline: true },
      { key: "home.whataido.innovation.title", label: "Innovation Card Title" },
      { key: "home.whataido.innovation.desc", label: "Innovation Card Description", multiline: true },
      { key: "home.whataido.values.title", label: "Values Card Title" },
      { key: "home.whataido.values.desc", label: "Values Card Description", multiline: true },
      { key: "home.cta.title", label: "Bottom Title" },
      { key: "home.cta.desc", label: "Bottom Description", multiline: true },
      { key: "home.cta.button", label: "Bottom Button" },
    ],
  },
  {
    id: "robot",
    label: "Robot",
    route: "/robot",
    fields: [
      { key: "robot.hero.title", label: "Hero Title" },
      { key: "robot.hero.desc", label: "Hero Description", multiline: true },
      { key: "robot.hero.image", label: "Hero Image", type: "image" },
      { key: "robot.image", label: "Robot Photo", type: "image" },
      { key: "robot.name.title", label: "Name Title" },
      { key: "robot.name.value", label: "Robot Name" },
      { key: "robot.name.desc", label: "Name Description", multiline: true },
      { key: "robot.whatis.title", label: "What It Does Title" },
      { key: "robot.whatis.desc", label: "What It Does Description", multiline: true },
      { key: "robot.programming.title", label: "Programming Title" },
      { key: "robot.challenges.title", label: "Challenges Title" },
      { key: "robot.attachments.title", label: "Attachments Title" },
      { key: "robot.attachments", label: "Attachments", type: "attachments" },
    ],
  },
  {
    id: "innovation",
    label: "Innovation",
    route: "/innovation-project",
    fields: [
      { key: "innovation.hero.title", label: "Hero Title" },
      { key: "innovation.hero.desc", label: "Hero Description", multiline: true },
      { key: "innovation.hero.image", label: "Hero Image", type: "image" },
      { key: "innovation.problem.title", label: "Problem Title" },
      { key: "innovation.problem.desc", label: "Problem Description", multiline: true },
      { key: "innovation.hypothesis.title", label: "Hypothesis Title" },
      { key: "innovation.hypothesis.desc", label: "Hypothesis Description", multiline: true },
      { key: "innovation.solution.title", label: "Solution Title" },
      { key: "innovation.solution.desc", label: "Solution Description", multiline: true },
      { key: "innovation.science.title", label: "Science Title" },
      { key: "innovation.science.desc", label: "Science Description", multiline: true },
    ],
  },
  {
    id: "values",
    label: "Values",
    route: "/core-values",
    fields: [
      { key: "values.hero.title", label: "Hero Title" },
      { key: "values.hero.desc", label: "Hero Description", multiline: true },
      { key: "values.closing.title", label: "Closing Title" },
      { key: "values.closing.desc", label: "Closing Description", multiline: true },
    ],
  },
  {
    id: "updates",
    label: "Updates",
    route: "/updates",
    fields: [
      { key: "updates.hero.title", label: "Hero Title" },
      { key: "updates.hero.desc", label: "Hero Description", multiline: true },
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    route: "/feedback",
    fields: [
      { key: "feedback.hero.title", label: "Hero Title" },
      { key: "feedback.hero.desc", label: "Hero Description", multiline: true },
    ],
  },
  {
    id: "photos",
    label: "Photos",
    route: "/photo-log",
    fields: [
      { key: "photos.hero.title", label: "Hero Title" },
      { key: "photos.hero.desc", label: "Hero Description", multiline: true },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    route: "/contact",
    fields: [
      { key: "contact.hero.title", label: "Hero Title" },
      { key: "contact.hero.desc", label: "Hero Description", multiline: true },
      { key: "contact.form.button", label: "Submit Button" },
      { key: "contact.success.title", label: "Success Title" },
      { key: "contact.success.desc", label: "Success Message", multiline: true },
    ],
  },
];

function InlineEdit({ field, value, onChange }: { field: Field; value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  if (field.type === "image") {
    return (
      <div className="group relative">
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-48 object-contain bg-muted rounded-lg border" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-black hover:bg-white/90 flex items-center gap-1.5">
                <ImagePlus className="h-3.5 w-3.5" /> Replace
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("file", file);
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  if (data.url) onChange(data.url);
                }} />
              </label>
              <button onClick={() => onChange("")} className="px-3 py-1.5 bg-red-500 rounded-lg text-sm font-medium text-white hover:bg-red-600 flex items-center gap-1.5">
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </>
        ) : (
          <label className="flex items-center justify-center gap-2 h-32 rounded-lg border-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.append("file", file);
              const res = await fetch("/api/upload", { method: "POST", body: fd });
              const data = await res.json();
              if (data.url) onChange(data.url);
            }} />
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Upload image</span>
          </label>
        )}
      </div>
    );
  }

  if (!editing) {
    return (
      <div
        onClick={() => { setTemp(value); setEditing(true); }}
        className="cursor-text rounded-md px-2 py-1 -mx-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-colors group"
      >
        <span className="text-sm">{value || <span className="text-muted-foreground italic">Click to edit...</span>}</span>
        <Pencil className="h-3 w-3 inline-block ml-1.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {field.multiline ? (
        <Textarea value={temp} onChange={(e) => setTemp(e.target.value)} rows={3} className="resize-none text-sm" autoFocus />
      ) : (
        <Input value={temp} onChange={(e) => setTemp(e.target.value)} className="h-9 text-sm" autoFocus />
      )}
      <div className="flex flex-col gap-1">
        <Button size="sm" onClick={() => { onChange(temp); setEditing(false); }} className="h-8 px-2">Save</Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-8 px-2">Cancel</Button>
      </div>
    </div>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 ${className || ""}`}>{children}</div>;
}

type Attachment = { image: string; title: string; desc: string };

function AttachmentsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  let items: Attachment[] = [];
  try { items = value ? JSON.parse(value) : []; } catch { items = []; }

  function update(i: number, patch: Partial<Attachment>) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(JSON.stringify(next));
  }

  function remove(i: number) {
    onChange(JSON.stringify(items.filter((_, idx) => idx !== i)));
  }

  function add() {
    onChange(JSON.stringify([...items, { image: "", title: "", desc: "" }]));
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3 relative">
          <button onClick={() => remove(i)} className="absolute top-2 right-2 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Image</label>
            {item.image ? (
              <div className="relative group">
                <img src={item.image} alt="" className="w-full h-32 object-contain bg-muted rounded-lg border" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-black hover:bg-white/90 flex items-center gap-1.5">
                    <ImagePlus className="h-3.5 w-3.5" /> Replace
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append("file", file);
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      const data = await res.json();
                      if (data.url) update(i, { image: data.url });
                    }} />
                  </label>
                  <button onClick={() => update(i, { image: "" })} className="px-3 py-1.5 bg-red-500 rounded-lg text-sm font-medium text-white hover:bg-red-600 flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("file", file);
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  if (data.url) update(i, { image: data.url });
                }} />
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload image</span>
              </label>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Title</label>
            <Input value={item.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Attachment title" className="h-9 text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Textarea value={item.desc} onChange={(e) => update(i, { desc: e.target.value })} placeholder="Brief description" rows={2} className="resize-none text-sm" />
          </div>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <Plus className="h-4 w-4" /> Add attachment
      </button>
    </div>
  );
}

export default function PagesEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activePage, setActivePage] = useState(PAGES[0].id);
  const [content, setContent] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      setLoading(true);
      fetch("/api/admin/content")
        .then((r) => r.json())
        .then((data: Record<string, string>) => { setContent(data); setOriginal(data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

  const updateField = useCallback((key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const pageConfig = PAGES.find((p) => p.id === activePage)!;
  const hasChanges = pageConfig.fields.some((f) => (content[f.key] || "") !== (original[f.key] || ""));

  async function saveAll() {
    setSaving(true);
    setSaved(false);
    try {
      const changed = pageConfig.fields.filter((f) => (content[f.key] || "") !== (original[f.key] || ""));
      await Promise.all(
        changed.map((f) =>
          fetch("/api/admin/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: f.key, value: content[f.key] || "" }),
          })
        )
      );
      setOriginal((prev) => {
        const next = { ...prev };
        pageConfig.fields.forEach((f) => { next[f.key] = content[f.key] || ""; });
        return next;
      });
      invalidateContent();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {} finally {
      setSaving(false);
    }
  }

  if (status === "loading" || !session) return null;

  const c = (key: string, fallback: string) => content[key] || fallback;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-sm">Edit Pages</h1>
            <span className="text-xs text-muted-foreground hidden sm:inline">Click any text to edit it</span>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && !saved && <span className="text-xs text-orange-500">Unsaved changes</span>}
            {saved && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Saved</span>}
            <a href={pageConfig.route} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1.5 h-8">
                <Eye className="h-3.5 w-3.5" /> View Live
              </Button>
            </a>
            <Button size="sm" onClick={saveAll} disabled={!hasChanges || saving} className="gap-1.5 h-8">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Page tabs */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {PAGES.map((page) => {
              const dirty = page.fields.some((f) => (content[f.key] || "") !== (original[f.key] || ""));
              return (
                <button
                  key={page.id}
                  onClick={() => setActivePage(page.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activePage === page.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {page.label}
                  {dirty && <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 inline-block" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {activePage === "home" && (
              <>
                {/* Site Logo */}
                <div className="rounded-xl border-2 bg-card p-6">
                  <SectionLabel>Site Logo</SectionLabel>
                  <p className="text-xs text-muted-foreground mb-3">Shows in navbar and footer. Leave empty for default icon.</p>
                  <InlineEdit field={pageConfig.fields[0]} value={c("site.logo", "")} onChange={(v) => updateField("site.logo", v)} />
                </div>

                {/* Favicon */}
                <div className="rounded-xl border-2 bg-card p-6">
                  <SectionLabel>Favicon</SectionLabel>
                  <p className="text-xs text-muted-foreground mb-3">Upload a .png image that shows in the browser tab. Recommended size: 32x32 or 64x64 pixels.</p>
                  <InlineEdit field={pageConfig.fields[1]} value={c("site.favicon", "")} onChange={(v) => updateField("site.favicon", v)} />
                </div>

                {/* Hero */}
                <div className="rounded-xl border-2 overflow-hidden">
                  <div className="bg-gradient-to-br from-cyan-50 via-blue-50/40 to-emerald-50 dark:from-cyan-950/20 dark:via-blue-950/10 dark:to-emerald-950/20 p-8 text-center relative">
                    <div className="absolute inset-0">
                      <div className="absolute -top-24 left-1/4 h-[300px] w-[300px] rounded-full bg-cyan-200/20 dark:bg-cyan-500/5 blur-3xl" />
                      <div className="absolute -bottom-24 right-1/4 h-[300px] w-[300px] rounded-full bg-emerald-200/20 dark:bg-emerald-500/5 blur-3xl" />
                    </div>
                    <div className="relative">
                      <SectionLabel>Hero Section</SectionLabel>
                      <div className="mb-4">
                        <InlineEdit field={pageConfig.fields[2]} value={c("home.hero.subtitle", "")} onChange={(v) => updateField("home.hero.subtitle", v)} />
                      </div>
                      <div className="mb-3">
                        <InlineEdit field={pageConfig.fields[1]} value={c("home.hero.title", "")} onChange={(v) => updateField("home.hero.title", v)} />
                      </div>
                      <div className="mb-4 max-w-md mx-auto">
                        <InlineEdit field={pageConfig.fields[3]} value={c("home.hero.description", "")} onChange={(v) => updateField("home.hero.description", v)} />
                      </div>
                      <div className="mb-4">
                        <InlineEdit field={pageConfig.fields[4]} value={c("home.hero.image", "")} onChange={(v) => updateField("home.hero.image", v)} />
                      </div>
                      <div className="flex gap-3 justify-center">
                        <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-cyan-500/15">
                          <InlineEdit field={pageConfig.fields[5]} value={c("home.hero.button1", "")} onChange={(v) => updateField("home.hero.button1", v)} />
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border text-sm font-medium">
                          <InlineEdit field={pageConfig.fields[6]} value={c("home.hero.button2", "")} onChange={(v) => updateField("home.hero.button2", v)} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What We Do */}
                <div className="rounded-xl border-2 bg-card p-6">
                  <SectionLabel>What We Do Section</SectionLabel>
                  <div className="text-center mb-4">
                    <InlineEdit field={pageConfig.fields[7]} value={c("home.whataido.title", "")} onChange={(v) => updateField("home.whataido.title", v)} />
                    <div className="mt-1">
                      <InlineEdit field={pageConfig.fields[8]} value={c("home.whataido.desc", "")} onChange={(v) => updateField("home.whataido.desc", v)} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { titleKey: 9, descKey: 10, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/20" },
                      { titleKey: 11, descKey: 12, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
                      { titleKey: 13, descKey: 14, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20" },
                    ].map((card, i) => (
                      <div key={i} className="rounded-lg border bg-card p-4 ring-1 ring-transparent">
                        <div className={`p-2 rounded-lg ${card.bg} w-fit mb-3`}>
                          <div className={`h-5 w-5 ${card.color}`}>{i === 0 ? "🤖" : i === 1 ? "🔬" : "❤️"}</div>
                        </div>
                        <InlineEdit field={pageConfig.fields[card.titleKey]} value={c(pageConfig.fields[card.titleKey].key, "")} onChange={(v) => updateField(pageConfig.fields[card.titleKey].key, v)} />
                        <div className="mt-1">
                          <InlineEdit field={pageConfig.fields[card.descKey]} value={c(pageConfig.fields[card.descKey].key, "")} onChange={(v) => updateField(pageConfig.fields[card.descKey].key, v)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-br from-cyan-600 via-blue-500 to-emerald-500 p-8 text-center relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDYpIi8+PC9zdmc+')] opacity-50" />
                    <div className="relative">
                      <SectionLabel className="!text-white/60">Bottom CTA Section</SectionLabel>
                      <InlineEdit field={pageConfig.fields[15]} value={c("home.cta.title", "")} onChange={(v) => updateField("home.cta.title", v)} />
                      <div className="mt-2 max-w-md mx-auto">
                        <InlineEdit field={pageConfig.fields[16]} value={c("home.cta.desc", "")} onChange={(v) => updateField("home.cta.desc", v)} />
                      </div>
                      <div className="mt-4">
                        <span className="inline-flex items-center px-6 py-2.5 rounded-lg bg-white text-cyan-700 text-sm font-semibold shadow-xl">
                          <InlineEdit field={pageConfig.fields[17]} value={c("home.cta.button", "")} onChange={(v) => updateField("home.cta.button", v)} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePage === "robot" && (
              <>
                {/* Hero */}
                <div className="rounded-xl border-2 overflow-hidden">
                  <div className="bg-gradient-to-br from-cyan-50 via-blue-50/40 to-emerald-50 dark:from-cyan-950/20 dark:via-blue-950/10 dark:to-emerald-950/20 p-8 text-center relative">
                    <div className="absolute inset-0">
                      <div className="absolute -top-24 left-1/4 h-[300px] w-[300px] rounded-full bg-cyan-200/20 blur-3xl" />
                      <div className="absolute -bottom-24 right-1/4 h-[300px] w-[300px] rounded-full bg-emerald-200/20 blur-3xl" />
                    </div>
                    <div className="relative">
                      <SectionLabel>Hero</SectionLabel>
                      <InlineEdit field={pageConfig.fields[0]} value={c("robot.hero.title", "")} onChange={(v) => updateField("robot.hero.title", v)} />
                      <div className="mt-3 max-w-md mx-auto">
                        <InlineEdit field={pageConfig.fields[1]} value={c("robot.hero.desc", "")} onChange={(v) => updateField("robot.hero.desc", v)} />
                      </div>
                      <div className="mt-4">
                        <InlineEdit field={pageConfig.fields[2]} value={c("robot.hero.image", "")} onChange={(v) => updateField("robot.hero.image", v)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Robot Photo */}
                <div className="rounded-xl border-2 bg-card p-6">
                  <SectionLabel>Robot Photo</SectionLabel>
                  <InlineEdit field={pageConfig.fields[3]} value={c("robot.image", "")} onChange={(v) => updateField("robot.image", v)} />
                </div>

                {/* Name Section */}
                <div className="rounded-xl border-2 bg-card p-6">
                  <SectionLabel>Name Section</SectionLabel>
                  <InlineEdit field={pageConfig.fields[4]} value={c("robot.name.title", "")} onChange={(v) => updateField("robot.name.title", v)} />
                  <div className="mt-2 text-2xl font-bold">
                    <InlineEdit field={pageConfig.fields[5]} value={c("robot.name.value", "")} onChange={(v) => updateField("robot.name.value", v)} />
                  </div>
                  <div className="mt-2">
                    <InlineEdit field={pageConfig.fields[6]} value={c("robot.name.desc", "")} onChange={(v) => updateField("robot.name.desc", v)} />
                  </div>
                </div>

                {/* What It Does */}
                <div className="rounded-xl border-2 bg-card p-6">
                  <SectionLabel>What It Does</SectionLabel>
                  <InlineEdit field={pageConfig.fields[7]} value={c("robot.whatis.title", "")} onChange={(v) => updateField("robot.whatis.title", v)} />
                  <div className="mt-2">
                    <InlineEdit field={pageConfig.fields[8]} value={c("robot.whatis.desc", "")} onChange={(v) => updateField("robot.whatis.desc", v)} />
                  </div>
                </div>

                {/* Programming & Challenges */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border-2 bg-card p-6">
                    <SectionLabel>Programming</SectionLabel>
                    <InlineEdit field={pageConfig.fields[9]} value={c("robot.programming.title", "")} onChange={(v) => updateField("robot.programming.title", v)} />
                  </div>
                  <div className="rounded-xl border-2 bg-card p-6">
                    <SectionLabel>Challenges</SectionLabel>
                    <InlineEdit field={pageConfig.fields[10]} value={c("robot.challenges.title", "")} onChange={(v) => updateField("robot.challenges.title", v)} />
                  </div>
                </div>

                {/* Attachments */}
                <div className="rounded-xl border-2 bg-card p-6">
                  <SectionLabel>Attachments</SectionLabel>
                  <p className="text-xs text-muted-foreground mb-3">Add images, files, or documents related to your robot.</p>
                  <AttachmentsEditor
                    value={c("robot.attachments", "")}
                    onChange={(v) => updateField("robot.attachments", v)}
                  />
                </div>
              </>
            )}

            {activePage === "innovation" && (
              <>
                {/* Hero */}
                <div className="rounded-xl border-2 overflow-hidden">
                  <div className="bg-gradient-to-br from-cyan-50 via-blue-50/40 to-emerald-50 dark:from-cyan-950/20 dark:via-blue-950/10 dark:to-emerald-950/20 p-8 text-center relative">
                    <div className="absolute inset-0">
                      <div className="absolute -top-24 left-1/4 h-[300px] w-[300px] rounded-full bg-cyan-200/20 blur-3xl" />
                      <div className="absolute -bottom-24 right-1/4 h-[300px] w-[300px] rounded-full bg-emerald-200/20 blur-3xl" />
                    </div>
                    <div className="relative">
                      <SectionLabel>Hero</SectionLabel>
                      <InlineEdit field={pageConfig.fields[0]} value={c("innovation.hero.title", "")} onChange={(v) => updateField("innovation.hero.title", v)} />
                      <div className="mt-3 max-w-md mx-auto">
                        <InlineEdit field={pageConfig.fields[1]} value={c("innovation.hero.desc", "")} onChange={(v) => updateField("innovation.hero.desc", v)} />
                      </div>
                      <div className="mt-4">
                        <InlineEdit field={pageConfig.fields[2]} value={c("innovation.hero.image", "")} onChange={(v) => updateField("innovation.hero.image", v)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Sections */}
                {[
                  { titleIdx: 3, descIdx: 4, color: "bg-red-50 dark:bg-red-950/20 text-red-500" },
                  { titleIdx: 5, descIdx: 6, color: "bg-amber-50 dark:bg-amber-950/20 text-amber-500" },
                  { titleIdx: 7, descIdx: 8, color: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500" },
                  { titleIdx: 9, descIdx: 10, color: "bg-blue-50 dark:bg-blue-950/20 text-blue-500" },
                ].map((section, i) => (
                  <div key={i} className="rounded-xl border-2 bg-card p-6">
                    <SectionLabel>{["Problem", "Hypothesis", "Solution", "Science"][i]}</SectionLabel>
                    <InlineEdit field={pageConfig.fields[section.titleIdx]} value={c(pageConfig.fields[section.titleIdx].key, "")} onChange={(v) => updateField(pageConfig.fields[section.titleIdx].key, v)} />
                    <div className="mt-2">
                      <InlineEdit field={pageConfig.fields[section.descIdx]} value={c(pageConfig.fields[section.descIdx].key, "")} onChange={(v) => updateField(pageConfig.fields[section.descIdx].key, v)} />
                    </div>
                  </div>
                ))}
              </>
            )}

            {activePage === "values" && (
              <>
                {/* Hero */}
                <div className="rounded-xl border-2 overflow-hidden">
                  <div className="bg-gradient-to-br from-cyan-50 via-blue-50/40 to-emerald-50 dark:from-cyan-950/20 dark:via-blue-950/10 dark:to-emerald-950/20 p-8 text-center relative">
                    <div className="relative">
                      <SectionLabel>Hero</SectionLabel>
                      <InlineEdit field={pageConfig.fields[0]} value={c("values.hero.title", "")} onChange={(v) => updateField("values.hero.title", v)} />
                      <div className="mt-3 max-w-md mx-auto">
                        <InlineEdit field={pageConfig.fields[1]} value={c("values.hero.desc", "")} onChange={(v) => updateField("values.hero.desc", v)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Closing */}
                <div className="rounded-xl border-2 bg-card p-6">
                  <SectionLabel>Closing Section</SectionLabel>
                  <InlineEdit field={pageConfig.fields[2]} value={c("values.closing.title", "")} onChange={(v) => updateField("values.closing.title", v)} />
                  <div className="mt-2">
                    <InlineEdit field={pageConfig.fields[3]} value={c("values.closing.desc", "")} onChange={(v) => updateField("values.closing.desc", v)} />
                  </div>
                </div>
              </>
            )}

            {(activePage === "updates" || activePage === "feedback" || activePage === "photos") && (
              <>
                {/* Hero */}
                <div className="rounded-xl border-2 overflow-hidden">
                  <div className="bg-gradient-to-br from-cyan-50 via-blue-50/40 to-emerald-50 dark:from-cyan-950/20 dark:via-blue-950/10 dark:to-emerald-950/20 p-8 text-center relative">
                    <div className="relative">
                      <SectionLabel>Hero</SectionLabel>
                      <InlineEdit field={pageConfig.fields[0]} value={c(pageConfig.fields[0].key, "")} onChange={(v) => updateField(pageConfig.fields[0].key, v)} />
                      <div className="mt-3 max-w-md mx-auto">
                        <InlineEdit field={pageConfig.fields[1]} value={c(pageConfig.fields[1].key, "")} onChange={(v) => updateField(pageConfig.fields[1].key, v)} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePage === "contact" && (
              <>
                {/* Hero */}
                <div className="rounded-xl border-2 overflow-hidden">
                  <div className="bg-gradient-to-br from-cyan-50 via-blue-50/40 to-emerald-50 dark:from-cyan-950/20 dark:via-blue-950/10 dark:to-emerald-950/20 p-8 text-center relative">
                    <div className="relative">
                      <SectionLabel>Hero</SectionLabel>
                      <InlineEdit field={pageConfig.fields[0]} value={c("contact.hero.title", "")} onChange={(v) => updateField("contact.hero.title", v)} />
                      <div className="mt-3 max-w-md mx-auto">
                        <InlineEdit field={pageConfig.fields[1]} value={c("contact.hero.desc", "")} onChange={(v) => updateField("contact.hero.desc", v)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Settings */}
                <div className="rounded-xl border-2 bg-card p-6">
                  <SectionLabel>Form Settings</SectionLabel>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Submit Button Text</label>
                      <InlineEdit field={pageConfig.fields[2]} value={c("contact.form.button", "")} onChange={(v) => updateField("contact.form.button", v)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Success Title</label>
                      <InlineEdit field={pageConfig.fields[3]} value={c("contact.success.title", "")} onChange={(v) => updateField("contact.success.title", v)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Success Message</label>
                      <InlineEdit field={pageConfig.fields[4]} value={c("contact.success.desc", "")} onChange={(v) => updateField("contact.success.desc", v)} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
