export interface StreamEvent {
  type: string;
  [key: string]: unknown;
}

interface StreamInput {
  message: string;
  conversationId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function streamChat(
  input: StreamInput,
  onEvent: (event: StreamEvent) => void,
) {
  const url = `${API_URL}/chat/stream`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Response body is empty.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true,
    });

    const blocks = buffer.split("\n\n");

    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      let eventType = "";
      let data = "";

      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim();
        }

        if (line.startsWith("data:")) {
          data += line.slice(5).trim();
        }
      }

      if (!data) continue;

      try {
        const parsed = JSON.parse(data);

        onEvent({
          type: eventType || parsed.type || "message",
          ...parsed,
        });
      } catch (error) {
        console.error("Invalid SSE data:", data, error);
      }
    }
  }
}
