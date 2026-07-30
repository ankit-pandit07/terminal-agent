import { promises as fs } from "fs";
import path from "path";

import type { WorkspaceInfo } from "./workspace.types.js";
import { WorkspaceCache } from "./workspace.cache.js";

export class WorkspaceService {
    
  constructor(private readonly root = process.cwd()) {}
private cache = new WorkspaceCache();
  async analyze(): Promise<WorkspaceInfo> {
    if (this.cache.has()) {
    return this.cache.get()!;
}
    const packageJsonPath = path.join(this.root, "package.json");

    const info: WorkspaceInfo = {
      root: this.root,

      packageManager: "unknown",
      language: "unknown",

      dependencies: [],
      devDependencies: [],

      scripts: {},

      folders: [],
      files: [],

      hasGit: false,
      hasPrisma: false,
      hasDocker: false,
    };

    // Read root directory
    const entries = await fs.readdir(this.root, {
      withFileTypes: true,
    });

    info.files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);

    info.folders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    // Detect Git
    info.hasGit = info.folders.includes(".git");

    // Detect Prisma
    info.hasPrisma = info.folders.includes("prisma");

    // Detect Docker
    info.hasDocker = info.files.includes("Dockerfile");

    // Read package.json
    try {
      const raw = await fs.readFile(packageJsonPath, "utf-8");
      const pkg = JSON.parse(raw);

      info.projectName = pkg.name;

      info.dependencies = Object.keys(pkg.dependencies ?? {});
      info.devDependencies = Object.keys(pkg.devDependencies ?? {});
      info.scripts = pkg.scripts ?? {};

      // Detect language
      if (
        info.dependencies.includes("typescript") ||
        info.devDependencies.includes("typescript")
      ) {
        info.language = "typescript";
      } else {
        info.language = "javascript";
      }

      // Detect package manager
      if (info.files.includes("pnpm-lock.yaml")) {
        info.packageManager = "pnpm";
      } else if (info.files.includes("yarn.lock")) {
        info.packageManager = "yarn";
      } else if (info.files.includes("bun.lockb")) {
        info.packageManager = "bun";
      } else if (info.files.includes("package-lock.json")) {
        info.packageManager = "npm";
      }

      // Detect ORM
      if (
        info.dependencies.includes("@prisma/client") ||
        info.devDependencies.includes("prisma")
      ) {
        info.orm = "prisma";
      }

      // Detect Framework
      if (info.dependencies.includes("express")) {
        info.framework = "express";
      } else if (info.dependencies.includes("next")) {
        info.framework = "next";
      } else if (info.dependencies.includes("react")) {
        info.framework = "react";
      }
    } catch {
      // package.json doesn't exist
    }
this.cache.set(info);

return info;
  }
}