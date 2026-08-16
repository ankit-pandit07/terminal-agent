import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

export type StatusType =
  | "SUCCESS"
  | "COMPLETED"
  | "RUNNING"
  | "EXECUTING"
  | "FAILED"
  | "ERROR"
  | "WAITING"
  | "CONFIRMATION"
  | "CONFIRMATION_REQUIRED"
  | "IDLE"
  | "ENABLED"
  | "DISABLED"
  | "ONLINE"
  | "OFFLINE"
  | "CHECKING"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: "sm" | "default";
}

export function StatusBadge({ status, className, size = "default" }: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  let variant: "success" | "destructive" | "warning" | "info" | "secondary" | "default" = "secondary";
  let dotColor = "bg-zinc-400";
  let label = status;

  if (
    normalized === "SUCCESS" ||
    normalized === "COMPLETED" ||
    normalized === "ENABLED" ||
    normalized === "ONLINE"
  ) {
    variant = "success";
    dotColor = "bg-emerald-400";
    label = normalized === "SUCCESS" ? "Success" : normalized === "COMPLETED" ? "Completed" : normalized === "ENABLED" ? "Enabled" : "Online";
  } else if (
    normalized === "RUNNING" ||
    normalized === "EXECUTING" ||
    normalized === "IN_PROGRESS"
  ) {
    variant = "info";
    dotColor = "bg-blue-400 animate-pulse";
    label = "Running";
  } else if (
    normalized === "FAILED" ||
    normalized === "ERROR" ||
    normalized === "DISABLED" ||
    normalized === "OFFLINE"
  ) {
    variant = "destructive";
    dotColor = "bg-red-400";
    label = normalized === "FAILED" ? "Failed" : normalized === "ERROR" ? "Error" : normalized === "DISABLED" ? "Disabled" : "Offline";
  } else if (
    normalized === "WAITING" ||
    normalized === "CONFIRMATION" ||
    normalized === "CONFIRMATION_REQUIRED" ||
    normalized === "CHECKING"
  ) {
    variant = "warning";
    dotColor = "bg-amber-400 animate-pulse";
    label = normalized === "CHECKING" ? "Checking" : "Confirmation Required";
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        "gap-1.5 font-medium tracking-tight",
        size === "sm" ? "px-2 py-0 text-[11px]" : "px-2.5 py-0.5 text-xs",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />
      <span>{label}</span>
    </Badge>
  );
}
