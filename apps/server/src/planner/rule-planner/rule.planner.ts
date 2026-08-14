import type { Plan } from "../planner.js";

import { RuleRegistry } from "./rule.registry.js";
import { DirectoryRule } from "./rules/directory.rule.js";
import { DockerRule } from "./rules/docker.rule.js";
import { FileRule } from "./rules/file.rule.js";
import { GitRule } from "./rules/git.rule.js";
import { NpmRule } from "./rules/npm.rule.js";
import { PrismaRule } from "./rules/prisma.rule.js";
import { SearchRule } from "./rules/search.rule.js";
import { TerminalRule } from "./rules/terminal.rule.js";

export class RulePlanner {
  private registry = new RuleRegistry();

  constructor() {
    this.registry.register(new FileRule());
    this.registry.register(new TerminalRule());
    this.registry.register(new SearchRule());
    this.registry.register(new DirectoryRule());
    this.registry.register(new NpmRule());
    this.registry.register(new GitRule());
    this.registry.register(new PrismaRule());
    this.registry.register(new DockerRule());
  }

  createPlan(message: string): Plan | null {
    for (const rule of this.registry.getRules()) {
      if (
        rule.match({
          message,
        })
      ) {
        return rule.execute({
          message,
        }).plan!;
      }
    }

    return null;
  }
}
