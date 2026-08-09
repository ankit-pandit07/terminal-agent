export function TypingIndicator() {
  return (
    <div className="mb-6 flex justify-start">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400">
          <span>🤖</span>
          <span>Assistant</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" />
        </div>
      </div>
    </div>
  );
}
