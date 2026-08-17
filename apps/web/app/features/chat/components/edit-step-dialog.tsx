"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Code, Wrench, Sparkles } from "lucide-react";
import type { PlanStep } from "../api/planning.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface EditStepDialogProps {
  step: PlanStep | null;
  stepIndex: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (index: number, updatedStep: PlanStep) => void;
}

export function EditStepDialog({
  step,
  stepIndex,
  open,
  onOpenChange,
  onSave,
}: EditStepDialogProps) {
  const [jsonString, setJsonString] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (step) {
      setJsonString(JSON.stringify(step.input, null, 2));
      setReason(step.reason || "");
      setPriority(step.priority !== undefined ? String(step.priority) : "");
      setValidationError(null);
    }
  }, [step]);

  function handleJsonChange(text: string) {
    setJsonString(text);
    if (!text.trim()) {
      setValidationError("Tool arguments JSON cannot be empty.");
      return;
    }
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setValidationError("Tool arguments must be a valid JSON object (key-value map).");
      } else {
        setValidationError(null);
      }
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Invalid JSON syntax.");
    }
  }

  function handleFormatJson() {
    try {
      const parsed = JSON.parse(jsonString);
      setJsonString(JSON.stringify(parsed, null, 2));
      setValidationError(null);
    } catch {
      // Keep existing string if invalid
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (stepIndex === null || !step) return;

    try {
      const parsedInput = JSON.parse(jsonString);
      if (typeof parsedInput !== "object" || parsedInput === null || Array.isArray(parsedInput)) {
        setValidationError("Tool arguments must be a valid JSON object.");
        return;
      }

      const updatedStep: PlanStep = {
        ...step,
        input: parsedInput as Record<string, unknown>,
        reason: reason.trim() || undefined,
        priority: priority.trim() !== "" ? Number(priority) : undefined,
      };

      onSave(stepIndex, updatedStep);
      onOpenChange(false);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Invalid JSON syntax.");
    }
  }

  if (!step || stepIndex === null) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-zinc-800 bg-zinc-950 text-zinc-100 p-6 shadow-2xl">
        <DialogHeader className="space-y-1 pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wrench className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold text-white">
              Edit Plan Step #{stepIndex + 1}
            </DialogTitle>
            <Badge variant="outline" className="font-mono text-xs text-blue-400">
              {step.tool}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-zinc-400">
            Modify the tool parameters or reasoning before executing the plan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Reason (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Step Reason / Description (Optional)
            </label>
            <Input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Inspect package dependencies"
              className="h-8 text-xs bg-zinc-900 border-zinc-800"
            />
          </div>

          {/* Priority (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Priority Number (Optional)
            </label>
            <Input
              type="number"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="e.g. 1"
              className="h-8 text-xs bg-zinc-900 border-zinc-800"
            />
          </div>

          {/* JSON Arguments Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <Code className="h-3.5 w-3.5 text-blue-400" />
                <span>Tool Input Arguments (JSON Object)</span>
              </label>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleFormatJson}
                className="h-6 text-[11px] text-zinc-400 hover:text-white px-2"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Format JSON
              </Button>
            </div>

            <textarea
              value={jsonString}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={8}
              spellCheck={false}
              className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-900/90 p-3 font-mono text-xs text-zinc-200 leading-relaxed placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 selection:bg-zinc-800"
            />
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-xs text-red-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-zinc-800/80 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-zinc-800 text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={Boolean(validationError)}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
