
export class CommandGuard {
  private readonly blockedCommands = [
    "rm -rf",
    "rmdir",
    "del ",
    "erase",
    "format",
    "shutdown",
    "reboot",
    "taskkill",
    "reg delete",
    "diskpart",
    "mkfs",
    "chmod 777",
    "curl |",
    "wget |",
  ];

  isSafe(command: string): boolean {
    const lower = command.toLowerCase();

    return !this.blockedCommands.some((blocked) =>
      lower.includes(blocked)
    );
  }
}