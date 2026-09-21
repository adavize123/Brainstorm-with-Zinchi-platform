import { Badge } from "@/components/ui/badge";
import { getDeadlineState, formatDateTime } from "@/lib/utils";

export function DeadlineBadge({ dueAt }: { dueAt: Date | string }) {
  const state = getDeadlineState(dueAt);
  const variant = state === "overdue" ? "destructive" : state === "soon" ? "warning" : "secondary";
  const label = state === "overdue" ? "Overdue" : state === "soon" ? "Due soon" : "Upcoming";

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant}>{label}</Badge>
      <span className="text-xs text-muted-foreground">{formatDateTime(dueAt)}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
    PENDING: "secondary",
    NOT_STARTED: "secondary",
    IN_PROGRESS: "warning",
    SUBMITTED: "default",
    LATE: "destructive",
    GRADED: "success",
    NEW: "secondary",
    CONTACTED: "warning",
    CONVERTED: "success",
    CLOSED: "outline",
  };
  return <Badge variant={map[status] ?? "outline"}>{status.replace("_", " ")}</Badge>;
}
