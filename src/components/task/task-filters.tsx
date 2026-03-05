"use client"

import { TaskStatus } from "@/lib/task-utils"
import { Search } from "lucide-react"


interface TaskFiltersProps {
  statusFilter: TaskStatus | "all"
  onStatusChange: (status: TaskStatus | "all") => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const statusOptions: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "All Tasks" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
]

export function TaskFilters({ statusFilter, onStatusChange, searchQuery, onSearchChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`
              px-3 py-1.5 text-sm rounded-md transition-colors
              ${statusFilter === option.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>
    </div>
  )
}