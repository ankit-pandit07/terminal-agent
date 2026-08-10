import { PlannerPanel } from "../../features/chat/components/planner-panel";

export default function PlannerPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Planner</h1>

          <p className="mt-1 text-sm text-zinc-500">
            Create, review, and execute agent plans.
          </p>
        </div>

        <PlannerPanel />
      </div>
    </div>
  );
}
