"use client";

import { Issue } from "@/types";
import { IssueCard } from "./IssueCard";

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M9 9h.01M15 9h.01M8 14s1.5 2 4 2 4-2 4-2" />
          </svg>
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

