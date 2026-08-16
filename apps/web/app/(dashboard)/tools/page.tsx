import { ToolsPanel } from "@/app/features/chat/components/tools-panel";
import { PageHeader } from "@/components/shared/page-header";

export default function ToolsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          title="Tool Registry"
          description="Manage runtime capabilities, file operations, terminal safety policies, and integrations."
        />

        <ToolsPanel />
      </div>
    </div>
  );
}
