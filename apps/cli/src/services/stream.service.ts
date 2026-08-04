import { StreamEvent } from "../types/stream-event.js";

export class StreamService {
  private readonly baseUrl = "http://localhost:5000";

  async stream(
    message: string,
    onEvent: (event: StreamEvent) => void,
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });

    if (!response.ok) {
      throw new Error("Unable to connect to server.");
    }
    if (!response.body) {
      throw new Error("No response stream.");
    }

    const reader = response.body.getReader();

    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, {
        stream: true,
      });

      const events = buffer.split("\n\n");

      buffer = events.pop() ?? "";

      for (const rawEvent of events) {
       const lines = rawEvent.split("\n");

        let eventType = "";
        let eventData = "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventType = line.replace("event:", "").trim();
          }

          if (line.startsWith("data:")) {
            eventData = line.replace("data:", "").trim();
          }
        }

        if (!eventType || !eventData) continue;

        try {
          const payload = JSON.parse(eventData);
          onEvent(payload as StreamEvent);

          if (eventType === "done") {
            return;
          }
        } catch (error) {
          console.error("SSE Parse Error:", error);
        }
      }
    }
  }
}
