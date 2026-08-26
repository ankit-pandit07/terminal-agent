"use client";

import { useEffect, useState } from "react";
import {
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Trash2,
  LogOut,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { authApi } from "../api/auth.api";
import type { AuthSessionInfo } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AuthSessionsPanel() {
  const [sessions, setSessions] = useState<AuthSessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [loggingOutOthers, setLoggingOutOthers] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchSessions();
  }, []);

  async function fetchSessions() {
    setLoading(true);
    try {
      const res = await authApi.getSessions();
      if (res.success && res.sessions) {
        setSessions(res.sessions);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId);
    setMessage(null);
    try {
      const res = await authApi.revokeSession(sessionId);
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setMessage("Session revoked successfully.");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      // ignore
    } finally {
      setRevokingId(null);
    }
  }

  async function handleLogoutOthers() {
    setLoggingOutOthers(true);
    setMessage(null);
    try {
      const res = await authApi.logoutOtherSessions();
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.isCurrent));
        setMessage(`Revoked ${res.count} other active session(s).`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      // ignore
    } finally {
      setLoggingOutOthers(false);
    }
  }

  function getDeviceIcon(device: string) {
    if (device === "Mobile") return <Smartphone className="h-4 w-4 text-zinc-400" />;
    if (device === "Tablet") return <Tablet className="h-4 w-4 text-zinc-400" />;
    return <Laptop className="h-4 w-4 text-zinc-400" />;
  }

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <Card className="border-zinc-800 bg-zinc-900/60 shadow-md">
      <CardHeader className="p-5 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Laptop className="h-4 w-4 text-blue-400" />
              <CardTitle className="text-sm font-semibold text-white">
                Authentication Sessions & Connected Devices
              </CardTitle>
            </div>
            <CardDescription>
              Manage active operator login tokens across browsers and workstations.
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => void fetchSessions()}
            disabled={loading}
            title="Refresh active sessions"
            className="text-zinc-400 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {message && (
          <Alert className="py-2.5 bg-emerald-950/40 border-emerald-900/60 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {loading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Session */}
            {currentSession && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Current Active Session
                </span>
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      {getDeviceIcon(currentSession.device)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-white">
                          {currentSession.browser} on {currentSession.os}
                        </p>
                        <Badge variant="outline" className="h-5 text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                          This Device
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        Last active: {new Date(currentSession.lastUsedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Sessions */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Other Active Sessions ({otherSessions.length})
                </span>

                {otherSessions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleLogoutOthers()}
                    disabled={loggingOutOthers}
                    className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 gap-1.5"
                  >
                    {loggingOutOthers ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <LogOut className="h-3 w-3" />
                    )}
                    <span>Logout Other Sessions</span>
                  </Button>
                )}
              </div>

              {otherSessions.length === 0 ? (
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-center">
                  <p className="text-xs text-zinc-500">
                    No other active sessions detected. You are only signed in on this device.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {otherSessions.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 flex items-center justify-between hover:border-zinc-700/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          {getDeviceIcon(s.device)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-200">
                            {s.browser} on {s.os}
                          </p>
                          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                            Last active: {new Date(s.lastUsedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleRevoke(s.id)}
                        disabled={revokingId === s.id}
                        className="h-8 px-2.5 text-xs text-zinc-400 hover:text-red-400 hover:border-red-900/60 border-zinc-800 gap-1"
                      >
                        {revokingId === s.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        <span>Revoke</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
