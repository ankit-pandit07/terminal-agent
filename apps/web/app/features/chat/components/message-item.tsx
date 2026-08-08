"use client";
import clsx from "clsx";
type Props = {
  role: "user" | "assistant";
  content: string;
};

export function MessageItem({ role, content }: Props) {
  const isUser = role === "user";
  return (
    <div
      className={clsx("flex mb-4", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={clsx(
          "max-w-2xl rounded-lg px-4 py-3",
          isUser ? "bg-blue-600 text-white" : "bg-zinc-800 text-white",
        )}
      >
        {content}
      </div>
    </div>
  );
}
