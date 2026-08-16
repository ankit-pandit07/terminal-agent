"use client";

import { useState } from "react";
import {
  FolderTree,
  GitBranch,
  Database,
  Terminal,
  Layers,
  Code2,
  Package,
  Cpu,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useWorkspace } from "../hooks/use-workspace";
import { CopyButton } from "@/components/shared/copy-button";
import { ErrorState } from "@/components/shared/error-state";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function WorkspacePanel() {
  const { workspace, loading, error, refresh } = useWorkspace();
  const [depSearch, setDepSearch] = useState("");

  if (loading) {
    return <CardGridSkeleton count={6} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load workspace info"
        error={error}
        onRetry={() => void refresh()}
      />
    );
  }

  if (!workspace) {
    return (
      <EmptyState
        icon={FolderTree}
        title="Workspace information unavailable"
        description="Unable to analyze the project workspace directory."
      />
    );
  }

  const filteredDeps = workspace.dependencies.filter((dep) =>
    dep.toLowerCase().includes(depSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Project Overview Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Project Overview & Stack
          </h2>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
            icon={Package}
            label="Project Name"
            value={workspace.projectName ?? "terminal-agent"}
          />

          <OverviewCard
            icon={Code2}
            label="Language"
            value={workspace.language}
          />

          <OverviewCard
            icon={Cpu}
            label="Framework"
            value={workspace.framework ?? "None"}
          />

          <OverviewCard
            icon={Terminal}
            label="Package Manager"
            value={workspace.packageManager}
          />

          <OverviewCard
            icon={Database}
            label="ORM"
            value={workspace.orm ?? "None"}
          />

          <OverviewCard
            icon={GitBranch}
            label="Git Repository"
            value={workspace.hasGit ? "Detected" : "Not Found"}
            isSuccess={workspace.hasGit}
          />

          <OverviewCard
            icon={Database}
            label="Prisma Schema"
            value={workspace.hasPrisma ? "Configured" : "Not Found"}
            isSuccess={workspace.hasPrisma}
          />

          <OverviewCard
            icon={Layers}
            label="Total Dependencies"
            value={`${workspace.dependencies.length} packages`}
          />
        </div>
      </div>

      {/* Dependencies Section */}
      <Card className="border-zinc-800 bg-zinc-900/60 shadow-md">
        <CardHeader className="p-5 pb-3 border-b border-zinc-800/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-400" />
              <CardTitle className="text-sm font-semibold text-white">
                Installed Dependencies
              </CardTitle>
              <Badge variant="outline" className="font-mono text-[10px]">
                {workspace.dependencies.length}
              </Badge>
            </div>

            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <Input
                type="text"
                placeholder="Filter dependencies..."
                value={depSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepSearch(e.target.value)}
                className="h-8 pl-8 text-xs bg-zinc-950/80 border-zinc-800"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {workspace.dependencies.length === 0 ? (
            <p className="text-xs text-zinc-500">No dependencies detected.</p>
          ) : filteredDeps.length === 0 ? (
            <p className="text-xs text-zinc-500">No dependencies match "{depSearch}".</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pr-1">
              {filteredDeps.map((dep) => (
                <span
                  key={dep}
                  className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-xs text-zinc-300 transition hover:border-zinc-700"
                >
                  {dep}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package Scripts Section */}
      <Card className="border-zinc-800 bg-zinc-900/60 shadow-md">
        <CardHeader className="p-5 pb-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-sm font-semibold text-white">
              Package Scripts & Commands
            </CardTitle>
            <Badge variant="outline" className="font-mono text-[10px]">
              {Object.keys(workspace.scripts).length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {Object.keys(workspace.scripts).length === 0 ? (
            <p className="text-xs text-zinc-500">No package scripts detected.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950/50">
              {Object.entries(workspace.scripts).map(([name, command]) => (
                <div
                  key={name}
                  className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between transition hover:bg-zinc-900/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold text-blue-400 shrink-0">
                      npm run {name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 max-w-md">
                    <code className="font-mono text-[11px] text-zinc-400 truncate bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/80">
                      {command}
                    </code>
                    <CopyButton text={`npm run ${name}`} size="icon-sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  isSuccess,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  isSuccess?: boolean;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/70 p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <Icon className="h-4 w-4 text-zinc-400" />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="font-mono text-xs font-semibold text-white truncate">
          {value}
        </p>
        {isSuccess !== undefined && (
          isSuccess ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
          )
        )}
      </div>
    </Card>
  );
}
