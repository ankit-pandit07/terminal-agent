"use client";

import { useEffect, useState } from "react";
import {
  Server,
  Sliders,
  RefreshCw,
  Cpu,
  User as UserIcon,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/app/features/auth/store/auth.store";
import { authApi } from "@/app/features/auth/api/auth.api";
import { PageHeader } from "@/components/shared/page-header";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore();

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

  // Profile Edit State
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user]);

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

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);

    const ok = await updateProfile({ name: displayName.trim() });
    setSavingProfile(false);
    if (ok) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      setChangingPassword(false);
      if (res.success) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setTimeout(() => setPasswordSuccess(false), 4000);
      } else {
        setPasswordError(res.message || "Failed to update password.");
      }
    } catch (err: unknown) {
      setChangingPassword(false);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to change password.";
      setPasswordError(msg);
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <PageHeader
          title="Settings & System Config"
          description="Manage your account profile, backend API connectivity, local UI preferences, and view agent architecture specifications."
        />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 sm:w-fit bg-zinc-950/80 p-1 border border-zinc-800">
            <TabsTrigger value="profile" className="gap-2 text-xs">
              <UserIcon className="h-3.5 w-3.5" />
              <span>Account & Profile</span>
            </TabsTrigger>

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

          {/* Section 0: Account & Profile */}
          <TabsContent value="profile" className="space-y-6">
            {/* User Profile Card */}
            <Card className="border-zinc-800 bg-zinc-900/60 shadow-md">
              <CardHeader className="p-5 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-blue-400" />
                      <CardTitle className="text-sm font-semibold text-white">
                        Personal Profile Details
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Information associated with your authenticated NodeBase operator account.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="gap-1 bg-blue-500/10 border-blue-500/30 text-blue-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Isolated Workspace</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {profileSuccess && (
                  <Alert className="py-2.5 bg-emerald-950/40 border-emerald-900/60 text-xs text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <AlertDescription>Profile information updated successfully.</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Display Name
                      </label>
                      <Input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your Name"
                        className="h-10 bg-zinc-950/90 border-zinc-800 text-xs text-zinc-200"
                        disabled={savingProfile}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Email Address
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="email"
                          value={user?.email || "Not configured"}
                          readOnly
                          className="h-10 bg-zinc-950/90 border-zinc-800 text-xs text-zinc-400"
                        />
                        {user?.email && (
                          <Badge variant="outline" className="h-7 text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Mobile Phone Number
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={user?.phone || "Not linked"}
                          readOnly
                          className="h-10 bg-zinc-950/90 border-zinc-800 font-mono text-xs text-zinc-400"
                        />
                        {user?.phone && (
                          <Badge variant="outline" className="h-7 text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            OTP Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Account Identifier
                      </label>
                      <Input
                        type="text"
                        value={user?.id || ""}
                        readOnly
                        className="h-10 font-mono text-xs text-zinc-500 bg-zinc-950/90 border-zinc-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={savingProfile}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card className="border-zinc-800 bg-zinc-900/60 shadow-md">
              <CardHeader className="p-5 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-400" />
                  <CardTitle className="text-sm font-semibold text-white">
                    Change Password
                  </CardTitle>
                </div>
                <CardDescription>
                  Update your authentication credentials. Minimum 8 characters required.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {passwordSuccess && (
                  <Alert className="py-2.5 bg-emerald-950/40 border-emerald-900/60 text-xs text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <AlertDescription>Password updated successfully.</AlertDescription>
                  </Alert>
                )}

                {passwordError && (
                  <Alert variant="destructive" className="py-2.5 bg-red-950/40 border-red-900/60 text-xs">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-10 bg-zinc-950/90 border-zinc-800 text-xs text-zinc-200 font-mono"
                      disabled={changingPassword}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-10 bg-zinc-950/90 border-zinc-800 text-xs text-zinc-200 font-mono"
                      disabled={changingPassword}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={changingPassword}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-medium"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

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