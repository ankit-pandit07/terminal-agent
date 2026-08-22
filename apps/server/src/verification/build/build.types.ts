export interface BuildCommand {
  command: string;
  reason: string;
}

export interface BuildResult {
  success: boolean;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}