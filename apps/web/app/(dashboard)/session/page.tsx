import { SessionPanel } from "@/app/features/chat/components/session-panel";
import { PageHeader } from "@/components/shared/page-header";

export default function SessionPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          title="Active Session State"
          description="Observability into current working directory, executed commands, modified paths, and recovery history."
        />

        <SessionPanel />
      </div>
    </div>
  );
}
