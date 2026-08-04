import { ExecutorService } from "../executor/executor.service.js";

const executor = new ExecutorService();

export async function getSession() {
  return executor.getSession().getSnapshot();
}

export function buildSessionContext(): string {
  const session = executor.getSession();

  return `
==============================
Execution Memory
==============================

Current Directory:
${session.getCurrentDirectory()}

Last Tool:
${session.getLastTool() ?? "None"}

Last Error:
${session.getLastError() ?? "None"}

Retry Count:
${session.getRetryCount()}

--------------------------------

Executed Commands:
${
  session.getExecutedCommands().length
    ? session
        .getExecutedCommands()
        .map((cmd) => `- ${cmd}`)
        .join("\n")
    : "None"
}

--------------------------------

Successful Commands:
${
  session.getSuccessfulCommands().length
    ? session
        .getSuccessfulCommands()
        .map((cmd) => `- ${cmd}`)
        .join("\n")
    : "None"
}

--------------------------------

Failed Commands:
${
  session.getFailedCommands().length
    ? session
        .getFailedCommands()
        .map((cmd) => `- ${cmd}`)
        .join("\n")
    : "None"
}

--------------------------------

Modified Files:
${
  session.getModifiedFiles().length
    ? session
        .getModifiedFiles()
        .map((file) => `- ${file}`)
        .join("\n")
    : "None"
}

--------------------------------

Visited Directories:
${
  session.getVisitedDirectories().length
    ? session
        .getVisitedDirectories()
        .map((dir) => `- ${dir}`)
        .join("\n")
    : "None"
}

--------------------------------

Recovery History:
${
  session.getRecoveryHistory().length
    ? session
        .getRecoveryHistory()
        .map((item) => `- ${item}`)
        .join("\n")
    : "None"
}
`;
}