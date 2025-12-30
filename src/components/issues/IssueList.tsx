"use client";

import { Issue } from "@/types";
import { IssueCard } from "./IssueCard";
import { AlertTriangle } from "lucide-react";

interface IssueListProps {
  issues: Issue[];
  onIssueUpdated: (issue: Issue) => void;
  onIssueDeleted: (issueId: string) => void;
}

export function IssueList({ issues, onIssueUpdated, onIssueDeleted }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={16} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No issues found</h3>
        <p className="text-muted-foreground max-w-sm">
          Create your first issue or adjust your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          onIssueUpdated={onIssueUpdated}
          onIssueDeleted={onIssueDeleted}
        />
      ))}
    </div>
  );
}

