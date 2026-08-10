export type PatchOperationType = "insert" | "replace" | "delete";

export interface PatchOperation {
  type: PatchOperationType;
  start: number;
  end: number;
  text: string;
}

export interface Patch {
  operations: PatchOperation[];
  changed: boolean;
}

export interface PatchResult {
  success: boolean;
  content: string;
}
