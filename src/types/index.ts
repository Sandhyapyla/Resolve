// Issue Priority Levels
export type Priority = "low" | "medium" | "high";

// Issue Status Types
export type Status = "open" | "in_progress" | "done";

// Issue Interface
export interface Issue {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignedTo: string;
  createdAt: Date;
  createdBy: string;
  createdByEmail: string;
}

// Issue form data (without id and timestamps)
export interface IssueFormData {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignedTo: string;
}

// User interface for auth context
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

