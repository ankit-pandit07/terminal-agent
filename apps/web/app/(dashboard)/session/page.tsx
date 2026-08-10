import { SessionPanel } from "../../features/chat/components/session-panel";

export default function SessionPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Session</h1>

          <p className="mt-1 text-sm text-zinc-500">
            View the current agent execution session.
          </p>
        </div>

        <SessionPanel />
      </div>
    </div>
  );
}
