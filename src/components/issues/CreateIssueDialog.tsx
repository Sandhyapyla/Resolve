"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createIssue, findSimilarIssues } from "@/services/issues";
import { Issue, IssueFormData, Priority, Status } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertTriangle, Plus } from "lucide-react";

interface CreateIssueDialogProps {
  onIssueCreated: (issue: Issue) => void;
}

export function CreateIssueDialog({ onIssueCreated }: CreateIssueDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [similarIssues, setSimilarIssues] = useState<Issue[]>([]);
  const [showSimilarWarning, setShowSimilarWarning] = useState(false);
  const [formData, setFormData] = useState<IssueFormData>({
    title: "",
    description: "",
    priority: "medium",
    status: "open",
    assignedTo: "",
  });

  const { user } = useAuth();

  // Check for similar issues when title changes
  useEffect(() => {
    const checkSimilarIssues = async () => {
      if (formData.title.length >= 3) {
        const similar = await findSimilarIssues(formData.title);
        setSimilarIssues(similar);
        setShowSimilarWarning(similar.length > 0);
      } else {
        setSimilarIssues([]);
        setShowSimilarWarning(false);
      }
    };

    const debounce = setTimeout(checkSimilarIssues, 500);
    return () => clearTimeout(debounce);
  }, [formData.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create an issue");
      return;
    }

    setLoading(true);

    try {
      const newIssue = await createIssue(formData, user.uid, user.email || "Unknown");
      onIssueCreated(newIssue);
      toast.success("Issue created successfully!");
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "open",
        assignedTo: "",
      });
      setSimilarIssues([]);
      setShowSimilarWarning(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof IssueFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          New Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Issue</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new issue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {showSimilarWarning && similarIssues.length > 0 && (
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle size={16} className="text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">Similar Issues Found</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <p className="mb-2">The following issues might be related:</p>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  {similarIssues.slice(0, 3).map((issue) => (
                    <li key={issue.id} className="line-clamp-1">
                      <span className="font-medium">{issue.title}</span>
                      <span className="text-xs ml-2">({issue.status})</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs">You can still create this issue if it&apos;s different.</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the issue..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Priority) => handleInputChange("priority", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Status) => handleInputChange("status", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input
              id="assignedTo"
              placeholder="Email or name of assignee"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange("assignedTo", e.target.value)}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

