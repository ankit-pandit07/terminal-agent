export class LanguageAnalyzer {
  detect(
    dependencies: string[],
    devDependencies: string[],
  ): "typescript" | "javascript" | "unknown" {

    if (
      dependencies.includes("typescript") ||
      devDependencies.includes("typescript")
    ) {
      return "typescript";
    }

    if (
      dependencies.length ||
      devDependencies.length
    ) {
      return "javascript";
    }

    return "unknown";
  }
}