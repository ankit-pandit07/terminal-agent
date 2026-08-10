import { WorkspacePanel } from "../../features/chat/components/workspace-panel";

export default function WorkspacePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Workspace</h1>

          <p className="mt-1 text-sm text-zinc-500">
            View information about the current project workspace.
          </p>
        </div>

        <WorkspacePanel />
      </div>
    </div>
  );
}
