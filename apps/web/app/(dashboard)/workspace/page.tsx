import { WorkspacePanel } from "@/app/features/chat/components/workspace-panel";
import { PageHeader } from "@/components/shared/page-header";

export default function WorkspacePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          title="Workspace Environment"
          description="Project architecture, package manager, detected tools, dependencies, and available scripts."
        />

        <WorkspacePanel />
      </div>
    </div>
  );
}
