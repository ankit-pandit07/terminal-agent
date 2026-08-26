"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/features/auth/store/auth.store";
import { Dashboard } from "../components/layout/dashboard";
import { Terminal, Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authenticated, loading, checkAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!mounted || loading) return;

    if (!authenticated) {
      const redirectUrl = pathname ? `/login?next=${encodeURIComponent(pathname)}` : "/login";
      router.replace(redirectUrl);
    }
  }, [mounted, loading, authenticated, pathname, router]);

  // Loading Screen while verifying authentication
  if (!mounted || loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-xl animate-pulse">
            <Terminal className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span>Restoring secure session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <Dashboard>{children}</Dashboard>;
}