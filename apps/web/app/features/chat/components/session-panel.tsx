"use client";

import {
  Folder,
  Wrench,
  AlertTriangle,
  RefreshCw,
  Terminal,
  CheckCircle2,
  XCircle,
  FileCode,
  FolderTree,
  History,
  Cpu,
} from "lucide-react";
import { useSession } from "../hooks/use-session";
import { CopyButton } from "@/components/shared/copy-button";
import { ErrorState } from "@/components/shared/error-state";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SessionPanel() {
  const { session, loading, error, refresh } = useSession();

  if (loading) {
    return <CardGridSkeleton count={4} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load session state"
        error={error}
        onRetry={() => void refresh()}
      />
    );
  }

  if (!session) {
    return (
      <EmptyState
        icon={Cpu}
        title="No active session snapshot"
        description="Session state will be populated once the agent executes commands or modifies workspace files."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Current State Stats Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1: Current Directory */}
        <Card className="border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Working Directory
            </span>
            <Folder className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="font-mono text-xs text-zinc-200 truncate max-w-[80%]" title={session.currentDirectory}>
              {session.currentDirectory}
            </p>
            <CopyButton text={session.currentDirectory} size="icon-sm" />
          </div>
        </Card>

        {/* Stat 2: Last Tool */}
        <Card className="border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Last Invoked Tool
            </span>
            <Wrench className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 font-mono text-xs font-semibold text-white">
            {session.lastTool ?? "None"}
          </p>
        </Card>

        {/* Stat 3: Retry Count */}
        <Card className="border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Retry Counter
            </span>
            <RefreshCw className="h-4 w-4 text-purple-400" />
          </div>
          <p className="mt-2 text-base font-bold font-mono text-white">
            {session.retryCount}
          </p>
        </Card>

        {/* Stat 4: Modified Files Count */}
        <Card className="border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Modified Files
            </span>
            <FileCode className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-base font-bold font-mono text-emerald-400">
            {session.modifiedFiles.length}
          </p>
        </Card>
      </div>

      {/* Last Error Banner if present */}
      {session.lastError && (
        <Card className="border-red-900/50 bg-red-950/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-red-300">
                Last Recorded Error
              </span>
              <p className="font-mono text-xs text-red-300/90 whitespace-pre-wrap">
                {session.lastError}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs for Command Activity, Files, and History */}
      <Tabs defaultValue="commands" className="space-y-4">
        <TabsList className="grid grid-cols-3 sm:w-fit">
          <TabsTrigger value="commands" className="text-xs">
            Commands ({session.executedCommands.length})
          </TabsTrigger>
          <TabsTrigger value="files" className="text-xs">
            Files & Paths ({session.modifiedFiles.length + session.visitedDirectories.length})
          </TabsTrigger>
          <TabsTrigger value="recovery" className="text-xs">
            Recovery Log ({session.recoveryHistory.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Commands */}
        <TabsContent value="commands" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CommandListCard
              icon={CheckCircle2}
              iconColor="text-emerald-400"
              title="Successful Commands"
              badgeVariant="success"
              items={session.successfulCommands}
            />

            <CommandListCard
              icon={XCircle}
              iconColor="text-rose-400"
              title="Failed Commands"
              badgeVariant="destructive"
              items={session.failedCommands}
            />
          </div>

          <CommandListCard
            icon={Terminal}
            iconColor="text-blue-400"
            title="All Executed Commands"
            badgeVariant="default"
            items={session.executedCommands}
          />
        </TabsContent>

        {/* Tab 2: Files & Paths */}
        <TabsContent value="files" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CommandListCard
              icon={FileCode}
              iconColor="text-emerald-400"
              title="Modified Files"
              badgeVariant="success"
              items={session.modifiedFiles}
            />

            <CommandListCard
              icon={FolderTree}
              iconColor="text-blue-400"
              title="Visited Directories"
              badgeVariant="default"
              items={session.visitedDirectories}
            />
          </div>
        </TabsContent>

        {/* Tab 3: Recovery History */}
        <TabsContent value="recovery" className="space-y-4">
          <CommandListCard
            icon={History}
            iconColor="text-amber-400"
            title="Recovery History"
            badgeVariant="warning"
            items={session.recoveryHistory}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CommandListCard({
  icon: Icon,
  iconColor,
  title,
  badgeVariant,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  badgeVariant: "default" | "success" | "destructive" | "warning";
  items: string[];
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60 shadow-md">
      <CardHeader className="p-4 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${iconColor}`} />
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-white">
              {title}
            </CardTitle>
          </div>
          <Badge variant={badgeVariant} className="text-[10px]">
            {items.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {items.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-2">No records found.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="group flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200 transition hover:border-zinc-700"
              >
                <span className="truncate mr-2 break-all">{item}</span>
                <CopyButton text={item} size="icon-sm" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
