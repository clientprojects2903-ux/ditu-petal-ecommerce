import { Instagram, Youtube, Twitter } from "lucide-react"

// Types
export type TaskStatus = "pending" | "in_progress" | "in_review" | "completed"
export type TaskPriority = "low" | "medium" | "high"
export type Platform = "instagram" | "youtube" | "twitter"

// Task interface with string ID for component consistency
// In task-utils.ts, update the Task interface:

export interface Task {
  id: string;
  title: string;
  description: string;
  brandName: string;
  campaignName: string;
  campaignId: number | null;
  assignedTo: string;
  deadline: string;
  status: TaskStatus;
  priority?: 'low' | 'medium' | 'high';
  requirements: string[];
  deliverables?: Array<{ id: string; title: string; completed: boolean }>;
  createdAt?: string;
  updatedAt?: string;
  completed?: boolean;
  links?: string[];
  comments?: string | null;
}
// Deliverable interface
export interface Deliverable {
  id: string
  title: string
  completed: boolean
}

// Platform icon utility
export function getPlatformIcon(platform: Platform) {
  const icons = {
    instagram: Instagram,
    youtube: Youtube,
    twitter: Twitter,
  }
  return icons[platform] || Instagram
}

// Status utilities
export function getStatusColor(status: TaskStatus): string {
  const colors = {
    pending: "bg-warning/10 text-warning border-warning/20",
    in_progress: "bg-primary/10 text-primary border-primary/20",
    in_review: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    completed: "bg-success/10 text-success border-success/20",
  }
  return colors[status]
}

export function getStatusLabel(status: TaskStatus): string {
  const labels = {
    pending: "Pending",
    in_progress: "In Progress",
    in_review: "In Review",
    completed: "Completed",
  }
  return labels[status]
}

// Priority utilities
export function getPriorityColor(priority: TaskPriority): string {
  const colors = {
    low: "border-muted-foreground/30 text-muted-foreground",
    medium: "border-warning/50 text-warning",
    high: "border-destructive/50 text-destructive",
  }
  return colors[priority]
}

// Database to app status mapping
export function mapDbStatusToAppStatus(dbStatus: string | null): TaskStatus {
  if (!dbStatus) return 'pending'
  
  const statusMap: Record<string, TaskStatus> = {
    'pending': 'pending',
    'in_progress': 'in_progress',
    'in_review': 'in_review',
    'completed': 'completed',
    'approved': 'completed',
    'rejected': 'pending'
  }
  
  return statusMap[dbStatus.toLowerCase()] || 'pending'
}

// App to database status mapping
export function mapAppStatusToDbStatus(taskStatus: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    'pending': 'pending',
    'in_progress': 'in_progress',
    'in_review': 'in_review',
    'completed': 'completed'
  }
  return statusMap[taskStatus]
}

// Database to app priority mapping
export function mapDbPriorityToAppPriority(dbPriority: string | null): 'low' | 'medium' | 'high' {
  if (!dbPriority) return 'medium'
  
  const priorityMap: Record<string, 'low' | 'medium' | 'high'> = {
    'low': 'low',
    'medium': 'medium',
    'high': 'high'
  }
  
  return priorityMap[dbPriority.toLowerCase()] || 'medium'
}