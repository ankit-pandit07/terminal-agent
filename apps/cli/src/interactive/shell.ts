import { createInterface } from "readline";
import { stdin, stdout } from "process";

export class InteractiveShell {
  private rl = createInterface({
    input: stdin,
    output: stdout,
  });

  ask(): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question("> ", (answer:string) => {
        resolve(answer.trim());
      });
    });
  }

  close(): void {
    this.rl.close();
  }
}