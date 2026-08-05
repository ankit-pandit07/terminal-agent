export interface PackageInfo {
  name?: string;
  version?: string;

  private?: boolean;
  type?: string;
  packageManager?: string;
  scripts: Record<string, string>;
  dependencies: string[];
  devDependencies: string[];
  peerDependencies: string[];
  optionalDependencies: string[];
}
