"use client";

import { useRef, useState } from "react";
import { useChatStore } from "../store/chat.store";
import { useConversationStore } from "../store/conversation.store";
import { getConversation } from "../api/conversation.api";
import { streamChat } from "../api/chat.stream";

export interface RecoveryEvent {
  action: string;
  reason: string;
  confidence: number;
}

export function useChat() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const loading = useChatStore((s) => s.loading);
  const setLoading = useChatStore((s) => s.setLoading);
  const conversationId = useChatStore((s) => s.conversationId);

  const setConversationId = useChatStore((s) => s.setConversationId);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
  const addEvent = useChatStore((s) => s.addEvent);
  const setConfirmation = useChatStore((s) => s.setConfirmation);

  const addConversation = useConversationStore((s) => s.addConversation);
  const selectConversation = useConversationStore((s) => s.selectConversation);
  const updateConversationTimestamp = useConversationStore(
    (s) => s.updateConversationTimestamp
  );

  // Recovery state
  const [recovery, setRecovery] = useState<RecoveryEvent | null>(null);

  function stop() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }

  async function stream(message: string) {
    if (loading || !message.trim()) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setRecovery(null);

    addUserMessage(message);

    // If already in an active conversation, update its timestamp in sidebar
    if (conversationId) {
      updateConversationTimestamp(conversationId);
    }

    try {
      let finalHandled = false;

      await streamChat(
        {
          message,
          ...(conversationId ? { conversationId } : {}),
        },
        async (event) => {
          addEvent(event);

          // Recovery event
          if (event.type === "recovery") {
            setRecovery({
              action: String(event.action ?? "unknown"),
              reason: String(event.reason ?? "Recovery action required."),
              confidence: Number(event.confidence ?? 0),
            });
            return;
          }

          // Confirmation required
          if (event.type === "confirmation-required") {
            const confirmationId =
              typeof event.confirmationId === "string"
                ? event.confirmationId
                : undefined;

            const msg =
              typeof event.message === "string"
                ? event.message
                : "Confirmation required.";

            if (confirmationId) {
              setConfirmation(confirmationId, msg);
            }
            return;
          }

          // Handle final completion events: "completed" or "done"
          if (event.type === "completed" || event.type === "done") {
            if (finalHandled && event.type === "done") return;
            finalHandled = true;

            const responseText =
              typeof event.response === "string"
                ? event.response
                : typeof event.output === "string"
                  ? event.output
                  : "";

            if (responseText) {
              addAssistantMessage(responseText);
            }

            const activeConvId =
              typeof event.conversationId === "string"
                ? event.conversationId
                : conversationId;

            if (activeConvId) {
              setConversationId(activeConvId);

              try {
                const freshConv = await getConversation(activeConvId);
                addConversation(freshConv);
                selectConversation(freshConv.id);
              } catch (err) {
                console.error("Failed to refresh conversation history:", err);
              }

              // Update URL without causing page remount
              if (typeof window !== "undefined") {
                const targetUrl = `/chat?conversation=${activeConvId}`;
                if (window.location.search !== `?conversation=${activeConvId}`) {
                  window.history.replaceState(null, "", targetUrl);
                }
              }
            }
          }
        },
        controller.signal
      );
    } catch (error: unknown) {
      if (
        (error instanceof Error && error.name === "AbortError") ||
        controller.signal.aborted
      ) {
        console.log("Chat stream cancelled by user.");
        addAssistantMessage("*Generation was cancelled.*");
        return;
      }

      console.error("Chat stream failed:", error);
      addAssistantMessage(
        "Sorry, something went wrong while processing your request. Please try again."
      );
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  }

  return {
    loading,
    recovery,
    stream,
    stop,
  };
}
