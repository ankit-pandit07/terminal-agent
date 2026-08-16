"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Clock,
  Wrench,
  ChevronRight,
  Search,
} from "lucide-react";
import type { Execution } from "../api/execution.api";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Props {
  executions: Execution[];
}

export function ExecutionList({ executions }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = executions.filter((item) => {
    // Status filter
    if (filter !== "ALL") {
      if (filter === "SUCCESS" && item.status !== "SUCCESS") return false;
      if (filter === "FAILED" && item.status !== "FAILED") return false;
      if (
        filter === "RUNNING" &&
        (item.status === "SUCCESS" || item.status === "FAILED")
      )
        return false;
    }
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.goal.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.toolExecutions.some((t) => t.tool.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (executions.length === 0) {
    return (
      <EmptyState
        icon={Zap}
        title="No executions recorded"
        description="Run an agent query or planner task in a conversation to view detailed execution traces."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search executions by goal or tool..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-zinc-950/80 border-zinc-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "SUCCESS", "FAILED", "RUNNING"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                filter === st
                  ? "bg-zinc-800 text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-8 text-center text-xs text-zinc-500">
          No executions match your active filters.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 bg-zinc-950/50">
                  <TableHead className="w-[45%]">Goal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tools</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => router.push(`/executions/${item.id}`)}
                    className="border-zinc-800/60 hover:bg-zinc-800/50 cursor-pointer transition"
                  >
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        <span className="truncate max-w-md">{item.goal}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Wrench className="h-3 w-3 text-zinc-400" />
                        <span>{item.toolExecutions.length}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400 font-mono">
                      {new Date(item.startedAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-zinc-400 hover:text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/executions/${item.id}`)}
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 transition active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-400 shrink-0" />
                    <span className="font-semibold text-sm text-white line-clamp-1">
                      {item.goal}
                    </span>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-800/80">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3 text-zinc-500" />
                    {new Date(item.startedAt).toLocaleTimeString()}
                  </span>

                  <span className="flex items-center gap-1">
                    <Wrench className="h-3 w-3 text-zinc-500" />
                    {item.toolExecutions.length} tool(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
