"use client";

import {
  Wrench,
  Terminal,
  FileCode,
  Globe,
  Database,
  Shield,
} from "lucide-react";
import type { Tool } from "../api/tools.api";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  onToggle: (name: string, enabled: boolean) => void;
}

function getToolIcon(name: string, category?: string) {
  const n = name.toLowerCase();
  const c = (category || "").toLowerCase();
  if (n.includes("terminal") || c.includes("terminal") || c.includes("command")) return Terminal;
  if (n.includes("file") || c.includes("file") || c.includes("system")) return FileCode;
  if (n.includes("web") || n.includes("search") || c.includes("web")) return Globe;
  if (n.includes("db") || n.includes("prisma") || c.includes("database")) return Database;
  if (n.includes("safety") || c.includes("security")) return Shield;
  return Wrench;
}

export function ToolCard({ tool, onToggle }: ToolCardProps) {
  const { info } = tool;
  const isEnabled = info.enabled ?? true;
  const Icon = getToolIcon(tool.name, info.category);

  return (
    <Card
      className={cn(
        "border-zinc-800 bg-zinc-900/70 shadow-md transition hover:border-zinc-700 flex flex-col justify-between",
        !isEnabled && "opacity-60 bg-zinc-950/40",
      )}
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border shadow-inner",
                isEnabled
                  ? "border-blue-500/30 bg-blue-600/10 text-blue-400"
                  : "border-zinc-800 bg-zinc-800/40 text-zinc-500",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-white">
                  {info.displayName || tool.name}
                </CardTitle>
                {info.category && (
                  <Badge variant="outline" className="text-[10px]">
                    {info.category}
                  </Badge>
                )}
              </div>
              <span className="font-mono text-[11px] text-zinc-500">
                {tool.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={() => onToggle(tool.name, isEnabled)}
              aria-label={`Toggle ${info.displayName || tool.name}`}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2 space-y-3 flex-1">
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
          {info.description || tool.description}
        </p>

        {info.capabilities && info.capabilities.length > 0 && (
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Capabilities
            </span>
            <div className="flex flex-wrap gap-1">
              {info.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-mono text-[10.5px] text-zinc-300"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500 flex items-center justify-between">
        <span>v{info.version || "1.0.0"}</span>
        <span>Author: {info.author || "System"}</span>
      </CardFooter>
    </Card>
  );
}
