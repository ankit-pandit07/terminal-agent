"use client";

export function Sidebar() {
  return (
    <aside className="flex w-72 flex-col border-r border-zinc-800 bg-zinc-900">

      <div className="border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold text-white">
          NodeBase
        </h1>
      </div>

      <div className="p-4">
        <button className="w-full rounded-lg bg-blue-600 py-2 text-white">
          + New Chat
        </button>
      </div>

      <div className="flex-1 p-4 text-zinc-400">
        Conversation history will appear here.
      </div>

    </aside>
  );
}