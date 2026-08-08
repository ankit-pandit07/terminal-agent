"use client";

import { useChatStore } from "../store/chat.store";

export function EventList() {
  const events = useChatStore((s) => s.events);

  return (
    <div className="border-b p-3">
      {events.map((event, index) => (
        <div key={index}> {event.type}</div>
      ))}
    </div>
  );
}
