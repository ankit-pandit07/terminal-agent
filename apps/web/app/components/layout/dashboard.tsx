"use client";

import { useState } from "react";
import { Header } from "./header";
import { Inspector } from "./inspector";
import { Sidebar } from "./sidebar";
import { Terminal } from "./terminal";

interface Props {
  children: React.ReactNode;
}

export function Dashboard({ children }: Props) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onToggleInspector={() => setInspectorOpen(!inspectorOpen)}
          inspectorOpen={inspectorOpen}
        />

        {/* Content Body + Inspector */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">{children}</main>

          <Inspector
            isOpen={inspectorOpen}
            onToggle={() => setInspectorOpen(false)}
          />
        </div>

        {/* Console / Terminal */}
        <Terminal />
      </div>
    </div>
  );
}

