import { ChatInput } from "../../features/chat/components/chat-input";
import { ChatWindow } from "../../features/chat/components/chat-window";

export default function ChatPage(){
    return (
        <div className="flex h-full flex-col">
            <ChatWindow />
            <ChatInput />
        </div>
    );
}