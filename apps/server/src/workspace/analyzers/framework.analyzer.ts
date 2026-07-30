export class FrameworkAnalyzer {

  detect(dependencies: string[]): string | undefined {

    if (dependencies.includes("express"))
      return "express";

    if (dependencies.includes("next"))
      return "next";

    if (dependencies.includes("react"))
      return "react";

    if (dependencies.includes("fastify"))
      return "fastify";

    if (dependencies.includes("@nestjs/core"))
      return "nestjs";

    if (dependencies.includes("hono"))
      return "hono";

    return undefined;
  }

}