"use client";

import { Status, Priority } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface IssueFiltersProps {
  statusFilter: Status | "all";
  priorityFilter: Priority | "all";
  onStatusChange: (value: Status | "all") => void;
  onPriorityChange: (value: Priority | "all") => void;
}

export function IssueFilters({
  statusFilter,
  priorityFilter,
  onStatusChange,
  onPriorityChange,
}: IssueFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2">
        <Label htmlFor="status-filter" className="text-sm font-medium whitespace-nowrap">
          Status:
        </Label>
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusChange(value as Status | "all")}
        >
          <SelectTrigger className="w-[140px]" id="status-filter">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="priority-filter" className="text-sm font-medium whitespace-nowrap">
          Priority:
        </Label>
        <Select
          value={priorityFilter}
          onValueChange={(value) => onPriorityChange(value as Priority | "all")}
        >
          <SelectTrigger className="w-[140px]" id="priority-filter">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

