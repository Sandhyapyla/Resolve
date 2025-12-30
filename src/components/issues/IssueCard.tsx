"use client";

import { useState } from "react";
import { Issue, Status, Priority } from "@/types";
import { updateIssue, deleteIssue } from "@/services/issues";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  AlertTriangle,
  Calendar,
  EllipsisVertical,
  Trash,
  User,
} from "lucide-react";

interface IssueCardProps {
  issue: Issue;
  onIssueUpdated: (issue: Issue) => void;
  onIssueDeleted: (issueId: string) => void;
}

const priorityColors: Record<Priority, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusColors: Record<Status, string> = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const statusLabels: Record<Status, string> = {
  open: "Open",
  in_progress: "In Progress",
  done: "Done",
};

export function IssueCard({
  issue,
  onIssueUpdated,
  onIssueDeleted,
}: IssueCardProps) {
  const [updating, setUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusWarning, setStatusWarning] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: Status) => {
    // Check for invalid transition: Open -> Done
    if (issue.status === "open" && newStatus === "done") {
      setStatusWarning(
        "An issue cannot move directly from Open to Done. Please move it to 'In Progress' first."
      );
      return;
    }

    setStatusWarning(null);
    setUpdating(true);

    try {
      await updateIssue(issue.id, { status: newStatus });
      onIssueUpdated({ ...issue, status: newStatus });
      toast.success(`Status updated to ${statusLabels[newStatus]}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: Priority) => {
    setUpdating(true);

    try {
      await updateIssue(issue.id, { priority: newPriority });
      onIssueUpdated({ ...issue, priority: newPriority });
      toast.success(`Priority updated to ${newPriority}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update priority"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIssue(issue.id);
      onIssueDeleted(issue.id);
      toast.success("Issue deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete issue"
      );
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{issue.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {issue.description}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <EllipsisVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusWarning && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle size={16} className="mr-2" />
              <AlertDescription>{statusWarning}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Select
                value={issue.status}
                onValueChange={(value: Status) => handleStatusChange(value)}
                disabled={updating}
              >
                <SelectTrigger className="h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Priority:</span>
              <Select
                value={issue.priority}
                onValueChange={(value: Priority) => handlePriorityChange(value)}
                disabled={updating}
              >
                <SelectTrigger className="h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Badge
              variant="secondary"
              className={priorityColors[issue.priority]}
            >
              {issue.priority}
            </Badge>
            <Badge variant="secondary" className={statusColors[issue.status]}>
              {statusLabels[issue.status]}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2 border-t">
            {issue.assignedTo && (
              <div className="flex items-center gap-1">
                <User size={16} className="mr-2" />
                <span className="truncate max-w-[150px]">
                  {issue.assignedTo}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={16} className="mr-2" />
              <span>{formatDate(issue.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <User size={16} className="mr-2" />
              <span className="truncate max-w-[150px]">
                by {issue.createdByEmail}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Issue</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this issue? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
