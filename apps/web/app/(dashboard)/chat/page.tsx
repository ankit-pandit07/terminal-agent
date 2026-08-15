import { Suspense } from "react";
import { ChatInput } from "../../features/chat/components/chat-input";
import { ChatPageLoader } from "../../features/chat/components/chat-page-loader";
import { ChatWindow } from "../../features/chat/components/chat-window";

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Suspense fallback={null}>
        <ChatPageLoader />
      </Suspense>

      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>

      <ChatInput />
    </div>
  );
}
