"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Terminal,
  FolderSearch,
  Cpu,
  AlertTriangle,
  Check,
  X,
  Zap,
} from "lucide-react";
import { useChatStore } from "../store/chat.store";
import { useChat } from "../hooks/use-chat";
import { EventList } from "./event-list";
import { MessageList } from "./message-list";
import { confirmAction, cancelAction } from "../api/chat.api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SUGGESTED_PROMPTS = [
  {
    icon: FolderSearch,
    title: "Explore Workspace",
    prompt: "List the files in the workspace and analyze project structure.",
  },
  {
    icon: Terminal,
    title: "Check System Info",
    prompt: "Check the current node and npm versions in the terminal.",
  },
  {
    icon: Cpu,
    title: "Inspect Environment",
    prompt: "Analyze the workspace packages and dependencies.",
  },
  {
    icon: Zap,
    title: "Plan Next Steps",
    prompt: "Create an execution plan to verify project build status.",
  },
];

export function ChatWindow() {
  const messages = useChatStore((s) => s.messages);
  const events = useChatStore((s) => s.events);
  const confirmationId = useChatStore((s) => s.confirmationId);
  const confirmationMessage = useChatStore((s) => s.confirmationMessage);
  const clearConfirmation = useChatStore((s) => s.clearConfirmation);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
  const { stream, loading } = useChat();

  const [processing, setProcessing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, events, confirmationId]);

  async function handleConfirm() {
    if (!confirmationId || processing) return;

    try {
      setProcessing(true);
      const result = await confirmAction(confirmationId);
      clearConfirmation();
      addAssistantMessage(
        String(result.response ?? "Action confirmed and completed successfully."),
      );
    } catch (error) {
      console.error("Confirmation failed:", error);
      addAssistantMessage("Failed to confirm the action.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleCancel() {
    if (!confirmationId || processing) return;

    try {
      setProcessing(true);
      const result = await cancelAction(confirmationId);
      clearConfirmation();
      addAssistantMessage(String(result.response ?? "Action was cancelled."));
    } catch (error) {
      console.error("Cancellation failed:", error);
      addAssistantMessage("Failed to cancel the action.");
    } finally {
      setProcessing(false);
    }
  }

  function handlePromptClick(prompt: string) {
    if (loading) return;
    void stream(prompt);
  }

  const isEmpty = messages.length === 0 && events.length === 0;

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-y-auto px-4 py-6 sm:px-6">
      {/* Empty State with AI Branding & Quick Starters */}
      {isEmpty && (
        <div className="my-auto flex flex-col items-center justify-center py-10 text-center animate-in fade-in-0 duration-300">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/20 mb-5">
            <Bot className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Terminal Agent Workspace
          </h2>

          <p className="mt-2 max-w-md text-sm text-zinc-400 leading-relaxed">
            Execute shell commands, analyze files, and plan multi-step operations safely with intelligent AI guardrails.
          </p>

          <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            {SUGGESTED_PROMPTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePromptClick(item.prompt)}
                  disabled={loading}
                  className="group flex flex-col items-start rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 text-left shadow-xs transition hover:border-zinc-700 hover:bg-zinc-850 cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-zinc-300 group-hover:text-blue-400 transition-colors">
                    <Icon className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-semibold">{item.title}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Agent Activity Timeline */}
      <EventList />

      {/* Messages */}
      <MessageList />

      {/* Confirmation Panel (Guardrail) */}
      {confirmationId && confirmationMessage && (
        <div className="my-4 rounded-2xl border border-amber-500/40 bg-zinc-900 p-5 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
                  High-Impact Action Confirmation
                </h3>
                <p className="text-xs text-zinc-400">
                  Approval is required before executing this command
                </p>
              </div>
            </div>

            <Badge variant="warning">Action Guardrail</Badge>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {confirmationMessage}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={processing}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <X className="h-4 w-4 mr-1.5" />
              <span>{processing ? "Processing..." : "Cancel"}</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleConfirm}
              disabled={processing}
              className="bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
            >
              <Check className="h-4 w-4 mr-1.5" />
              <span>{processing ? "Executing..." : "Confirm & Execute"}</span>
            </Button>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
