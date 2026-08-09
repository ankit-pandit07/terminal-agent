import { ChatInput } from "../../features/chat/components/chat-input";
import { ChatPageLoader } from "../../features/chat/components/chat-page-loader";
import { ChatWindow } from "../../features/chat/components/chat-window";

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ChatPageLoader />

      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>

      <div className="border-t border-zinc-800 bg-zinc-950 p-4">
        <ChatInput />
      </div>
    </div>
  );
}