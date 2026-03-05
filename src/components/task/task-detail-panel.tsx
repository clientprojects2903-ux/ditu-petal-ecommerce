"use client"

import { useState } from "react"
import { Calendar, FileText, Upload, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import { getStatusColor, getStatusLabel, TaskStatus } from "@/lib/task-utils"
import { SubmitTaskModal } from "@/components/task/submit-task-modal"

// Define Task interface locally to match what's passed from parent
interface Task {
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

interface TaskDetailPanelProps {
  task: Task | null
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => Promise<void> | void
  onTaskSubmitted?: () => void
}

export function TaskDetailPanel({ task, onStatusChange, onTaskSubmitted }: TaskDetailPanelProps) {
  const [submitModalOpen, setSubmitModalOpen] = useState(false)

  if (!task) {
    return (
      <div className="bg-card border border-border rounded-lg h-fit sticky top-24">
        <div className="p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Select a task to view details</p>
        </div>
      </div>
    )
  }

  const handleStatusToggle = () => {
    if (!onStatusChange) return
    
    if (task.status === "pending") {
      onStatusChange(task.id, "in_progress")
    } else if (task.status === "in_progress") {
      onStatusChange(task.id, "pending")
    }
  }

  const handleSubmitTask = (data: { links: string[]; comments: string }) => {
    console.log("Task submitted:", { taskId: task.id, ...data })
    if (onStatusChange) {
      onStatusChange(task.id, "in_review")
    }
  }

  const handleSubmitSuccess = () => {
    if (onTaskSubmitted) {
      onTaskSubmitted()
    }
  }

  const canToggleStatus = task.status === "pending" || task.status === "in_progress"
  const canSubmit = task.status === "in_progress"

  return (
    <>
      <div className="bg-card border border-border rounded-lg h-fit sticky top-24">
        <div className="p-5 pb-3 border-b border-border">
          <div className="flex items-start justify-between gap-2">
            <div>
              {/* Campaign name displayed prominently with new color */}
              <h3 className="text-base font-bold" style={{ color: '#87599a' }}>{task.campaignName}</h3>
            </div>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", getStatusColor(task.status))}>
              {getStatusLabel(task.status)}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-1">{task.title}</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {new Date(task.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          <div>
            <h4 className="font-medium text-foreground mb-2">Requirements</h4>
            <ul className="space-y-1.5">
              {task.requirements.map((req, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  {/* Bullet point with new color */}
                  <span className="mt-1" style={{ color: '#87599a' }}>•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px w-full bg-border" />

          <div className="flex flex-col gap-2">
            {canToggleStatus && (
              <button
                onClick={handleStatusToggle}
                className={cn(
                  "w-full px-4 py-2 border rounded-md transition-colors",
                  task.status === "pending"
                    ? "bg-opacity-10 border text-white hover:bg-opacity-20"
                    : "bg-amber-500/10 border-amber-500 text-amber-500 hover:bg-amber-500/20",
                )}
                style={task.status === "pending" ? { 
                  backgroundColor: '#87599a20', 
                  borderColor: '#87599a',
                  color: '#87599a'
                } : {}}
              >
                <div className="flex items-center justify-center">
                  {task.status === "pending" ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Working
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Task
                    </>
                  )}
                </div>
              </button>
            )}

            <button
              onClick={() => setSubmitModalOpen(true)}
              disabled={!canSubmit}
              className="w-full px-4 py-2 text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 transition-colors flex items-center justify-center"
              style={{ backgroundColor: '#87599a' }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Submit Task
            </button>
          </div>
        </div>
      </div>

      <SubmitTaskModal
        open={submitModalOpen}
        onOpenChange={setSubmitModalOpen}
        taskTitle={task.title}
        taskId={task.id}
        campaignId={task.campaignId}
        assignedTo={task.assignedTo}
        onSubmit={handleSubmitTask}
        onSuccess={handleSubmitSuccess}
      />
    </>
  )
}