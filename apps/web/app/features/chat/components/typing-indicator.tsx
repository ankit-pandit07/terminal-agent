import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TypingIndicator() {
  return (
    <div className="mb-6 flex items-start gap-3.5 animate-in fade-in-0 duration-300">
      <Avatar className="h-8 w-8 shrink-0 border border-zinc-700 bg-zinc-800 text-blue-400">
        <AvatarFallback className="bg-zinc-800 text-blue-400">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="rounded-2xl rounded-tl-xs border border-zinc-800 bg-zinc-900/90 px-4 py-3 shadow-md">
        <div className="flex items-center gap-1.5 py-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300" />
        </div>
      </div>
    </div>
  );
}
