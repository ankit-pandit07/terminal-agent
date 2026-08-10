import { ToolsPanel } from "../../features/chat/components/tools-panel";

export default function ToolsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tools</h1>

            <p className="mt-1 text-sm text-zinc-500">
              Manage the tools available to your agent.
            </p>
          </div>
        </div>

        <ToolsPanel />
      </div>
    </div>
  );
}
