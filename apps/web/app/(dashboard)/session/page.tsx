import { SessionPanel } from "@/app/features/chat/components/session-panel";
import { AuthSessionsPanel } from "@/app/features/auth/components/auth-sessions-panel";
import { PageHeader } from "@/components/shared/page-header";

export default function SessionPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <PageHeader
          title="Active Session State & Connected Devices"
          description="Observability into current working directory, executed commands, recovery history, and active authentication session tokens."
        />

        {/* Section 1: Authentication Sessions */}
        <AuthSessionsPanel />

        {/* Section 2: Agent Execution Memory & Session State */}
        <SessionPanel />
      </div>
    </div>
  );
}
