import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

function getFileName(path: string): string {
  return path.split("/").filter(Boolean).pop() || path;
}

function getLabel(toolInvocation: ToolInvocation): string {
  const args = toolInvocation.args as Record<string, string>;
  const fileName = args.path ? getFileName(args.path) : "";

  if (toolInvocation.toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return `Creating ${fileName}`;
      case "str_replace":
      case "insert":
        return `Editing ${fileName}`;
      case "view":
        return `Reading ${fileName}`;
      default:
        return `Working on ${fileName}`;
    }
  }

  if (toolInvocation.toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return `Renaming ${fileName}`;
      case "delete":
        return `Deleting ${fileName}`;
    }
  }

  return toolInvocation.toolName;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const isDone = toolInvocation.state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{getLabel(toolInvocation)}</span>
    </div>
  );
}
