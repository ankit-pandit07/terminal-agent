"use client";

import { useEffect, useState } from "react";
import { Header } from "./header";
import { Inspector } from "./inspector";
import { Sidebar } from "./sidebar";
import { Terminal } from "./terminal";
import { CommandPalette } from "@/components/shared/command-palette";

interface Props {
  children: React.ReactNode;
}

export function Dashboard({ children }: Props) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    // Open inspector on larger desktop screens by default
    if (typeof window !== "undefined" && window.innerWidth >= 1280) {
      setInspectorOpen(true);
    }
  }, []);

  // Global keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100 antialiased">
      {/* Left Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main App Column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onToggleInspector={() => setInspectorOpen(!inspectorOpen)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          inspectorOpen={inspectorOpen}
        />

        {/* Content Body + Right Inspector */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-zinc-950/60 focus:outline-hidden">
            {children}
          </main>

          <Inspector
            isOpen={inspectorOpen}
            onToggle={() => setInspectorOpen(false)}
          />
        </div>

        {/* Bottom Terminal Output Console */}
        <Terminal />
      </div>

      {/* Global Command Palette Dialog */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onToggleInspector={() => setInspectorOpen((prev) => !prev)}
      />
    </div>
  );
}

