import { startCLI } from "./cli.js";

startCLI().catch((err) => {
  console.error(err);
  process.exit(1);
});