"use client";

import { useEffect, useState } from "react";
import { Header } from "./header";
import { Inspector } from "./inspector";
import { Sidebar } from "./sidebar";
import { Terminal } from "./terminal";

interface Props {
  children: React.ReactNode;
}

export function Dashboard({ children }: Props) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  useEffect(() => {
    // Open inspector on larger desktop screens by default
    if (typeof window !== "undefined" && window.innerWidth >= 1280) {
      setInspectorOpen(true);
    }
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
    </div>
  );
}
