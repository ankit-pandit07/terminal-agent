import { PlannerPanel } from "@/app/features/chat/components/planner-panel";
import { PageHeader } from "@/components/shared/page-header";

export default function PlannerPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          title="Task Planner"
          description="Create structured multi-step plans, review execution paths, and trigger autonomous agent tasks."
        />

        <PlannerPanel />
      </div>
    </div>
  );
}
