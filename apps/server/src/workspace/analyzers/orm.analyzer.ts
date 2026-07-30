export class OrmAnalyzer {

  detect(
    dependencies: string[],
    devDependencies: string[],
  ): string | undefined {

    if (
      dependencies.includes("@prisma/client") ||
      devDependencies.includes("prisma")
    ) {
      return "prisma";
    }

    if (
      dependencies.includes("drizzle-orm")
    ) {
      return "drizzle";
    }

    if (
      dependencies.includes("mongoose")
    ) {
      return "mongoose";
    }

    return undefined;
  }

}