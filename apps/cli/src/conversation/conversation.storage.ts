import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import type { ConversationSession } from "./conversation.types.js";

export class ConversationStorage {
  private readonly directory = path.join(
    os.homedir(),
    ".nodebase",
  );

  private readonly file = path.join(
    this.directory,
    "session.json",
  );

  save(session: ConversationSession): void {
    if (!fs.existsSync(this.directory)) {
      fs.mkdirSync(this.directory, {
        recursive: true,
      });
    }

    fs.writeFileSync(
      this.file,
      JSON.stringify(session, null, 2),
      "utf-8",
    );
  }

  load(): ConversationSession {
    if (!fs.existsSync(this.file)) {
      return {};
    }

    try {
      return JSON.parse(
        fs.readFileSync(this.file, "utf-8"),
      ) as ConversationSession;
    } catch {
      return {};
    }
  }

  clear(): void {
    if (fs.existsSync(this.file)) {
      fs.unlinkSync(this.file);
    }
  }
}