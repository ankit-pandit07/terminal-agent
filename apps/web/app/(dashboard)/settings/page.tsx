"use client";

import { useEffect, useState } from "react";
import {
  Server,
  Sliders,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [apiUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  );
  const [healthStatus, setHealthStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [healthMessage, setHealthMessage] = useState<string>("");
  const [latency, setLatency] = useState<number | null>(null);

  // Local preferences
  const [autoScroll, setAutoScroll] = useState(true);
  const [compactEvents, setCompactEvents] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    // Load local storage preferences
    const savedAutoScroll = localStorage.getItem("nodebase_auto_scroll");
    if (savedAutoScroll !== null) setAutoScroll(savedAutoScroll === "true");

    const savedCompactEvents = localStorage.getItem("nodebase_compact_events");
    if (savedCompactEvents !== null)
      setCompactEvents(savedCompactEvents === "true");

    const savedSound = localStorage.getItem("nodebase_sound_enabled");
    if (savedSound !== null) setSoundEnabled(savedSound === "true");

    void checkHealth();
  }, []);

  async function checkHealth() {
    setHealthStatus("checking");
    setHealthMessage("Testing backend connectivity...");
    const start = performance.now();

    try {
      const res = await api.get("/health");
      const duration = Math.round(performance.now() - start);
      setLatency(duration);

      if (res.status === 200) {
        setHealthStatus("online");
        setHealthMessage("Successfully connected to Terminal Agent backend server.");
      } else {
        setHealthStatus("offline");
        setHealthMessage(`Server returned HTTP ${res.status}`);
      }
    } catch {
      setHealthStatus("offline");
      setLatency(null);
      setHealthMessage(
        "Unable to establish connection with backend server at the specified URL.",
      );
    }
  }

  function handleToggleAutoScroll(value: boolean) {
    setAutoScroll(value);
    localStorage.setItem("nodebase_auto_scroll", String(value));
  }

  function handleToggleCompact(value: boolean) {
    setCompactEvents(value);
    localStorage.setItem("nodebase_compact_events", String(value));
  }

  function handleToggleSound(value: boolean) {
    setSoundEnabled(value);
    localStorage.setItem("nodebase_sound_enabled", String(value));
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <PageHeader
          title="Settings & System Config"
          description="Manage backend API connectivity, local UI preferences, and view agent architecture specifications."
        />

        <Tabs defaultValue="connection" className="space-y-6">
          <TabsList className="grid grid-cols-3 sm:w-fit">
            <TabsTrigger value="connection" className="gap-2 text-xs">
              <Server className="h-3.5 w-3.5" />
              <span>Backend Connection</span>
            </TabsTrigger>

            <TabsTrigger value="interface" className="gap-2 text-xs">
              <Sliders className="h-3.5 w-3.5" />
              <span>Interface Preferences</span>
            </TabsTrigger>

            <TabsTrigger value="agent" className="gap-2 text-xs">
              <Cpu className="h-3.5 w-3.5" />
              <span>Agent Specifications</span>
            </TabsTrigger>
          </TabsList>

          {/* Section 1: Backend Connection */}
          <TabsContent value="connection" className="space-y-4">
            <Card className="border-zinc-800 bg-zinc-900/60 shadow-md">
              <CardHeader className="p-5 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-blue-400" />
                      <CardTitle className="text-sm font-semibold text-white">
                        API Server Configuration
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Endpoint connection target for chat streams, task planner, and session telemetry.
                    </CardDescription>
                  </div>

                  <Badge
                    variant={
                      healthStatus === "online"
                        ? "success"
                        : healthStatus === "offline"
                          ? "destructive"
                          : "warning"
                    }
                    className="gap-1.5"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        healthStatus === "online"
                          ? "bg-emerald-400 animate-pulse"
                          : healthStatus === "offline"
                            ? "bg-red-400"
                            : "bg-amber-400 animate-ping"
                      }`}
                    />
                    <span>
                      {healthStatus === "checking"
                        ? "Checking..."
                        : healthStatus === "online"
                          ? "Connected"
                          : "Disconnected"}
                    </span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    API Base URL (Read-only environment variable)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={apiUrl}
                      readOnly
                      className="font-mono text-xs text-zinc-300 bg-zinc-950/90 border-zinc-800"
                    />
                    <CopyButton text={apiUrl} size="default" className="h-9 px-3 border border-zinc-800" />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">Connection Diagnostics</span>
                    {latency !== null && (
                      <span className="font-mono text-[11px] text-emerald-400">
                        {latency}ms latency
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                    {healthMessage}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => void checkHealth()}
                  disabled={healthStatus === "checking"}
                  className="gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      healthStatus === "checking" ? "animate-spin" : ""
                    }`}
                  />
                  <span>Test Connection</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Section 2: Interface Preferences */}
          <TabsContent value="interface" className="space-y-4">
            <Card className="border-zinc-800 bg-zinc-900/60 shadow-md">
              <CardHeader className="p-5 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-blue-400" />
                  <CardTitle className="text-sm font-semibold text-white">
                    Local UI Preferences
                  </CardTitle>
                </div>
                <CardDescription>
                  Settings stored locally in your browser storage.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-5 divide-y divide-zinc-800/60">
                {/* Pref 1: Auto scroll */}
                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-zinc-200">
                      Auto-scroll Stream
                    </p>
                    <p className="text-xs text-zinc-500">
                      Automatically follow streaming responses and agent timeline events.
                    </p>
                  </div>
                  <Switch
                    checked={autoScroll}
                    onCheckedChange={handleToggleAutoScroll}
                    aria-label="Auto scroll toggle"
                  />
                </div>

                {/* Pref 2: Compact Timeline */}
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-zinc-200">
                      Compact Activity Timeline
                    </p>
                    <p className="text-xs text-zinc-500">
                      Display agent execution steps in a denser layout format.
                    </p>
                  </div>
                  <Switch
                    checked={compactEvents}
                    onCheckedChange={handleToggleCompact}
                    aria-label="Compact timeline toggle"
                  />
                </div>

                {/* Pref 3: Theme */}
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-zinc-200">Theme Mode</p>
                    <p className="text-xs text-zinc-500">
                      Tailored dark-first developer theme enabled.
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                    Dark-First (Active)
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section 3: Agent Specs */}
          <TabsContent value="agent" className="space-y-4">
            <Card className="border-zinc-800 bg-zinc-900/60 shadow-md">
              <CardHeader className="p-5 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <CardTitle className="text-sm font-semibold text-white">
                    Agent Architecture & Guardrails
                  </CardTitle>
                </div>
                <CardDescription>
                  Active runtime parameters, verification policies, and streaming specifications.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Streaming Protocol
                    </span>
                    <p className="text-xs font-semibold text-zinc-200">
                      Server-Sent Events (SSE)
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Low-latency unidirectional chunked streaming with custom event frames.
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Safety Guardrails
                    </span>
                    <p className="text-xs font-semibold text-emerald-400">
                      Interactive Confirmation Required
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      High-impact actions require explicit operator approval.
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Execution Loop
                    </span>
                    <p className="text-xs font-semibold text-zinc-200">
                      Iterative ReAct + Reflection
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Automatic failure observation, replanning, and confidence ranking.
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Memory System
                    </span>
                    <p className="text-xs font-semibold text-zinc-200">
                      Prisma Vector & Key-Value Store
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Persistent storage of conversation turns and tool observation results.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}