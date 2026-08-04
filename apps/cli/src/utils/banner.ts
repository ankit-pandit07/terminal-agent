import chalk from "chalk";

export function printBanner() {
  console.clear();

  console.log(
    chalk.cyan(`
┌──────────────────────────────────────────────┐
│          🚀 NodeBase AI Terminal             │
│                                              │
│   Type 'exit' to quit the shell              │
└──────────────────────────────────────────────┘
`)
  );
}