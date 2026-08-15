"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";


export default function SettingsPage() {
  const [apiUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
  );
  const [healthStatus, setHealthStatus] = useState<"checking" | "online" | "offline">("checking");
  const [healthMessage, setHealthMessage] = useState<string>("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [compactEvents, setCompactEvents] = useState(false);

  useEffect(() => {
    // Load local storage preferences
    const savedAutoScroll = localStorage.getItem("nodebase_auto_scroll");
    if (savedAutoScroll !== null) setAutoScroll(savedAutoScroll === "true");

    const savedCompactEvents = localStorage.getItem("nodebase_compact_events");
    if (savedCompactEvents !== null) setCompactEvents(savedCompactEvents === "true");

    void checkHealth();
  }, []);

  async function checkHealth() {
    setHealthStatus("checking");
    setHealthMessage("Testing backend connectivity...");
    try {
      const res = await api.get("/health");
      if (res.status === 200) {
        setHealthStatus("online");
        setHealthMessage("Connected cleanly to Terminal Agent server.");
      } else {
        setHealthStatus("offline");
        setHealthMessage(`Server returned HTTP ${res.status}`);
      }
    } catch {
      setHealthStatus("offline");
      setHealthMessage("Unable to reach backend server at configured URL.");
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings & Preferences</h1>
          <p className="mt-1 text-sm text-zinc-400">
            View system connection status, interface settings, and agent parameters.
          </p>
        </div>

        {/* Section 1: Backend Connection */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Backend API Server</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                healthStatus === "online"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : healthStatus === "offline"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              }`}
            >
              {healthStatus === "checking"
                ? "Checking..."
                : healthStatus === "online"
                  ? "Online"
                  : "Offline"}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              API Base URL
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={apiUrl}
                readOnly
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-300 outline-none"
              />
              <button
                type="button"
                onClick={() => void checkHealth()}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-700"
              >
                Test Connection
              </button>
            </div>
            <p className="text-xs text-zinc-500">{healthMessage}</p>
          </div>
        </div>

        {/* Section 2: Interface Preferences */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Interface Preferences</h2>

          <div className="space-y-4 divide-y divide-zinc-800/60">
            {/* Preference item 1 */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-medium text-zinc-200">Auto-scroll Chat</p>
                <p className="text-xs text-zinc-500">
                  Automatically scroll down when new agent messages or events arrive.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => handleToggleAutoScroll(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-700 bg-zinc-950 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Preference item 2 */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Compact Timeline View</p>
                <p className="text-xs text-zinc-500">
                  Display execution event logs in a more dense list format.
                </p>
              </div>
              <input
                type="checkbox"
                checked={compactEvents}
                onChange={(e) => handleToggleCompact(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-700 bg-zinc-950 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Preference item 3 */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Theme Mode</p>
                <p className="text-xs text-zinc-500">Dark mode is active by default.</p>
              </div>
              <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                Dark Mode
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Agent Capabilities & Specs */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Agent Specifications</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Streaming Protocol
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-200">Server-Sent Events (SSE)</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Confirmation Guardrails
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-400">Active (Safe Execution)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}