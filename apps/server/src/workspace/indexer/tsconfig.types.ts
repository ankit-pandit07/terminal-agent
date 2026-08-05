export interface TsConfigInfo {
  baseUrl?: string;
  rootDir?: string;
  outDir?: string;
  module?: string;
  target?: string;
  paths: Record<string, string[]>;
  strict: boolean;
  jsx?: string;
}