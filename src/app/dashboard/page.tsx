"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { CreateIssueDialog } from "@/components/issues/CreateIssueDialog";
import { IssueList } from "@/components/issues/IssueList";
import { IssueFilters } from "@/components/issues/IssueFilters";
import { getFilteredIssues } from "@/services/issues";
import { Issue, Status, Priority } from "@/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const filteredIssues = await getFilteredIssues(
        statusFilter === "all" ? undefined : statusFilter,
        priorityFilter === "all" ? undefined : priorityFilter
      );
      setIssues(filteredIssues);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchIssues();
    }
  }, [user, fetchIssues]);

  const handleIssueCreated = (newIssue: Issue) => {
    setIssues((prev) => [newIssue, ...prev]);
  };

  const handleIssueUpdated = (updatedIssue: Issue) => {
    setIssues((prev) =>
      prev.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue))
    );
  };

  const handleIssueDeleted = (issueId: string) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== issueId));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Issues</h2>
            <p className="text-muted-foreground">
              Manage and track all your issues in one place
            </p>
          </div>
          <CreateIssueDialog onIssueCreated={handleIssueCreated} />
        </div>

        <IssueFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading issues...</div>
          </div>
        ) : (
          <IssueList
            issues={issues}
            onIssueUpdated={handleIssueUpdated}
            onIssueDeleted={handleIssueDeleted}
          />
        )}
      </main>
    </div>
  );
}

