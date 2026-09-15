"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Mail,
  User,
  MessageSquare,
  FlaskConical,
  Beaker,
  Droplets,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 gap-1.5 px-4 py-1.5 border border-blue-200/60 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Contact
          </Badge>
          <h1 className="text-4xl font-bold mb-3">Get in Touch</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Questions about our project? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardContent className="pt-6">
                {sent ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/20 mb-4">
                      <Send className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We&apos;ll get back to you as soon as possible.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSent(false)}
                    >
                      Send Another
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
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
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        Message
                      </label>
                      <Textarea
                        placeholder="Tell us about your question or idea..."
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="resize-none"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={sending}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {sending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-2">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/20">
                    <FlaskConical className="h-3.5 w-3.5 text-cyan-500" />
                  </div>
                  <h3 className="font-semibold text-sm">Project Questions</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ask about our experiment, hypothesis, or results.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                    <Beaker className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-sm">FLL Team</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Connect with Billistic Beaniez for collaboration or
                  feedback.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-sm">Response Time</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We typically respond within 24 hours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
