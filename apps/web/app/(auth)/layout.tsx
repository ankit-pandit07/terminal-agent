import type { Metadata } from "next";
import Link from "next/link";
import { Terminal, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication | NodeBase Agent",
  description: "Secure login and authentication for NodeBase AI Terminal Agent",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 px-4 py-8 text-zinc-100 overflow-x-hidden selection:bg-blue-600/30 selection:text-blue-200">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full" />

      {/* Header Branding */}
      <div className="mb-6 flex flex-col items-center text-center space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-colors shadow-xs group"
        >
          <div className="h-7 w-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
            <Terminal className="h-4 w-4" />
          </div>
          <span className="font-mono text-sm font-bold tracking-tight text-white">
            NodeBase
          </span>
          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            Agent
          </span>
        </Link>
      </div>

      {/* Main Form Container */}
      <main className="w-full max-w-md relative z-10">{children}</main>

      {/* Footer */}
      <footer className="mt-8 flex items-center gap-2 text-xs text-zinc-500">
        <Shield className="h-3.5 w-3.5 text-zinc-500" />
        <span>End-to-end encrypted session & multi-tenant isolation</span>
      </footer>
    </div>
  );
}
