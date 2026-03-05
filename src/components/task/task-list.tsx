"use client"

import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { getStatusColor, getStatusLabel, getPriorityColor } from "../../lib/task-utils"
import { useMemo } from "react"

// Types
export type TaskStatus = "pending" | "in_progress" | "in_review" | "completed"
export type TaskPriority = "low" | "medium" | "high"

// Updated Task interface - removed deliverables and requirements
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

// User interface for the users data
export interface User {
  id: string
  full_name: string
  email: string
  role: string
  profile_image_url?: string | null
}

// Component props interface
interface TaskListProps {
  tasks: Task[]
  selectedTaskId?: string
  onSelectTask: (task: Task) => void
  users?: User[] // Keep users prop in case it's needed elsewhere
}

export function TaskList({ tasks, selectedTaskId, onSelectTask, users = [] }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No tasks found matching your filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isSelected = selectedTaskId === task.id

        return (
          <div
            key={task.id}
            className={cn(
              "bg-card border border-border rounded-lg cursor-pointer transition-all hover:border-[#87599a]/50 p-4",
              isSelected && "border-[#87599a] ring-1 ring-[#87599a]"
            )}
            onClick={() => onSelectTask(task)}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground truncate">{task.title}</h3>
                    
                    {/* Campaign name in bold with new color */}
                    <div className="mt-2">
                      <span className="font-bold text-[#87599a]">{task.campaignName}</span>
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <span className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", 
                    getStatusColor(task.status)
                  )}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>

                {/* Task description preview */}
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-3">
                    {task.description}
                  </p>
                )}

                {/* Task metadata */}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  {/* Deadline */}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-[#87599a]" />
                    <span>
                      {new Date(task.deadline).toLocaleDateString("en-US", { 
                        month: "short", 
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  
                  {/* Priority badge */}
                  <span className={cn(
  "text-xs border rounded-full px-2 py-0.5", 
  getPriorityColor(task.priority || "medium") // Provide a default value
)}>
  {task.priority || "medium"} {/* Also display a default value */}
</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}