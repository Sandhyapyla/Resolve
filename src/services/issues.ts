import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Issue, IssueFormData, Status, Priority } from "@/types";

const ISSUES_COLLECTION = "issues";

// Convert Firestore document to Issue
const docToIssue = (doc: { id: string; data: () => Record<string, unknown> }): Issue => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title as string,
    description: data.description as string,
    priority: data.priority as Priority,
    status: data.status as Status,
    assignedTo: data.assignedTo as string,
    createdAt: (data.createdAt as Timestamp).toDate(),
    createdBy: data.createdBy as string,
    createdByEmail: data.createdByEmail as string,
  };
};

// Create a new issue
export const createIssue = async (
  issueData: IssueFormData,
  userId: string,
  userEmail: string
): Promise<Issue> => {
  const issueToCreate = {
    ...issueData,
    createdAt: Timestamp.now(),
    createdBy: userId,
    createdByEmail: userEmail,
  };

  const docRef = await addDoc(collection(db, ISSUES_COLLECTION), issueToCreate);
  
  return {
    id: docRef.id,
    ...issueData,
    createdAt: new Date(),
    createdBy: userId,
    createdByEmail: userEmail,
  };
};

// Get all issues (newest first)
export const getIssues = async (): Promise<Issue[]> => {
  const q = query(
    collection(db, ISSUES_COLLECTION),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToIssue({ id: doc.id, data: () => doc.data() }));
};

// Get issues with filters
export const getFilteredIssues = async (
  statusFilter?: Status,
  priorityFilter?: Priority
): Promise<Issue[]> => {
  let q = query(collection(db, ISSUES_COLLECTION), orderBy("createdAt", "desc"));

  if (statusFilter && priorityFilter) {
    q = query(
      collection(db, ISSUES_COLLECTION),
      where("status", "==", statusFilter),
      where("priority", "==", priorityFilter),
      orderBy("createdAt", "desc")
    );
  } else if (statusFilter) {
    q = query(
      collection(db, ISSUES_COLLECTION),
      where("status", "==", statusFilter),
      orderBy("createdAt", "desc")
    );
  } else if (priorityFilter) {
    q = query(
      collection(db, ISSUES_COLLECTION),
      where("priority", "==", priorityFilter),
      orderBy("createdAt", "desc")
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToIssue({ id: doc.id, data: () => doc.data() }));
};

// Update an issue
export const updateIssue = async (
  issueId: string,
  updates: Partial<IssueFormData>
): Promise<void> => {
  const issueRef = doc(db, ISSUES_COLLECTION, issueId);
  await updateDoc(issueRef, updates);
};

// Delete an issue
export const deleteIssue = async (issueId: string): Promise<void> => {
  const issueRef = doc(db, ISSUES_COLLECTION, issueId);
  await deleteDoc(issueRef);
};

// Search for similar issues based on title
export const findSimilarIssues = async (title: string): Promise<Issue[]> => {
  // Get all issues and filter client-side for similarity
  // In a production app, you might use a dedicated search service like Algolia
  const allIssues = await getIssues();
  
  const titleWords = title.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  
  if (titleWords.length === 0) return [];
  
  return allIssues.filter(issue => {
    const issueTitle = issue.title.toLowerCase();
    const issueDescription = issue.description.toLowerCase();
    
    // Check if any significant word from the new title appears in existing issues
    const matchCount = titleWords.filter(word => 
      issueTitle.includes(word) || issueDescription.includes(word)
    ).length;
    
    // Consider similar if more than half of the words match
    return matchCount >= Math.ceil(titleWords.length / 2);
  });
};

