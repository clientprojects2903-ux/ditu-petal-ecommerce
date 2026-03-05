'use client'
import { Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// Card Component
interface CardProps {
  children: React.ReactNode
  className?: string
}

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}

// CardHeader Component
interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

const CardHeader = ({ children, className = "" }: CardHeaderProps) => {
  return (
    <div className={`border-b border-gray-200 px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

// CardTitle Component
interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

const CardTitle = ({ children, className = "" }: CardTitleProps) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  )
}

// CardContent Component
interface CardContentProps {
  children: React.ReactNode
  className?: string
}

const CardContent = ({ children, className = "" }: CardContentProps) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

// Badge Component
interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "secondary" | "outline" | "destructive" | "warning" | "success"
  className?: string
}

const Badge = ({ children, variant = "default", className = "" }: BadgeProps) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
  
  const variantClasses = {
    default: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    destructive: "bg-red-100 text-red-700 hover:bg-red-100",
    warning: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    success: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Task Interface
interface Task {
  task_id?: number
  task_name: string
  task_description?: string | null
  campaign_id?: number | null
  assigned_to: string
  due_date: string | null
  priority: string
  completed: boolean
  created_at: string
  updated_at: string
  status?: string
  // Joined fields
  campaign_name?: string
  brand_name?: string
}

// UpcomingTasks Component
export function UpcomingTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUpcomingTasks()
  }, [])

  const fetchUpcomingTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError("Please log in to view tasks")
        setLoading(false)
        return
      }

      setUserId(user.id)

      // Check if tasks table exists by trying to fetch from it
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          campaigns (
            campaign_name,
            brand_id
          )
        `)
        .eq('assigned_to', user.id)
        .eq('completed', false)
        .order('due_date', { ascending: true })
        .limit(10)

      if (tasksError) {
        // If tasks table doesn't exist, create sample tasks from campaigns
        console.log("Tasks table doesn't exist or error:", tasksError)
        await createTasksFromCampaigns(user.id)
        return
      }

      if (tasksData && tasksData.length > 0) {
        // Get brand names for each task
        const tasksWithBrands = await Promise.all(
          tasksData.map(async (task) => {
            let brandName = ''
            if (task.campaigns?.brand_id) {
              const { data: brandData } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', task.campaigns.brand_id)
                .single()
              brandName = brandData?.full_name || ''
            }
            
            return {
              ...task,
              campaign_name: task.campaigns?.campaign_name || '',
              brand_name: brandName
            }
          })
        )

        setTasks(tasksWithBrands)
      } else {
        // If no tasks found, create some from campaigns
        await createTasksFromCampaigns(user.id)
      }

    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Function to create tasks from campaigns (if no tasks table exists)
  const createTasksFromCampaigns = async (userId: string) => {
    // Fetch ongoing campaigns for this user
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select(`
        campaign_id,
        campaign_name,
        brand_id,
        campaign_timeline_end,
        status,
        campaign_description
      `)
      .eq('influencer_id', userId)
      .in('status', ['active', 'pending', 'in_progress', 'assigned', 'started', 'approved'])
      .limit(5)

    if (!campaigns || campaigns.length === 0) {
      setTasks([])
      return
    }

    // Create sample tasks based on campaigns
    const sampleTasks = campaigns.map((campaign, index) => {
      const taskTypes = [
        "Submit content draft",
        "Post social media content",
        "Attend briefing call",
        "Shoot video content",
        "Review campaign materials",
        "Submit final deliverables",
        "Provide feedback",
        "Schedule content",
        "Edit content",
        "Create captions"
      ]

      const priorities = ['High', 'Medium', 'Low']
      
      // Calculate due date (within campaign timeline)
      const endDate = campaign.campaign_timeline_end ? new Date(campaign.campaign_timeline_end) : new Date()
      const dueDate = new Date(endDate)
      dueDate.setDate(dueDate.getDate() - Math.floor(Math.random() * 14)) // Random due date within 2 weeks before end

      return {
        task_id: index + 1,
        task_name: `${taskTypes[index % taskTypes.length]} for ${campaign.campaign_name}`,
        campaign_id: campaign.campaign_id,
        assigned_to: userId,
        due_date: dueDate.toISOString().split('T')[0],
        priority: priorities[index % priorities.length],
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        campaign_name: campaign.campaign_name,
        brand_name: ''
      } as Task
    })

    // Get brand names
    const tasksWithBrands = await Promise.all(
      sampleTasks.map(async (task) => {
        if (task.campaign_id) {
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('brand_id')
            .eq('campaign_id', task.campaign_id)
            .single()
          
          if (campaign?.brand_id) {
            const { data: brandData } = await supabase
              .from('users')
              .select('full_name')
              .eq('id', campaign.brand_id)
              .single()
            
            return {
              ...task,
              brand_name: brandData?.full_name || ''
            }
          }
        }
        return task
      })
    )

    setTasks(tasksWithBrands)
  }

  const getPriorityInfo = (priority: string) => {
    const priorityMap: Record<string, { variant: "destructive" | "warning" | "secondary", label: string, className: string }> = {
      High: { variant: "destructive" as const, label: "High", className: "bg-red-100 text-red-700" },
      Medium: { variant: "warning" as const, label: "Medium", className: "bg-amber-100 text-amber-700" },
      Low: { variant: "secondary" as const, label: "Low", className: "bg-gray-100 text-gray-700" },
    }
    
    return priorityMap[priority] || { variant: "secondary" as const, label: priority, className: "bg-gray-100 text-gray-700" }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline"
    
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const isDueSoon = (dateString: string | null) => {
    if (!dateString) return false
    
    const dueDate = new Date(dateString)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays <= 2 && diffDays >= 0
  }

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false
    
    const dueDate = new Date(dateString)
    const today = new Date()
    return dueDate < today
  }

  // Handle loading state
  if (loading) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
                    <div className="h-5 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <p className="text-gray-600 mb-2">{error}</p>
            <button
              onClick={fetchUpcomingTasks}
              className="text-sm px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-gray-600 mb-2">No upcoming tasks</p>
            <p className="text-sm text-gray-500">All caught up! New tasks will appear here.</p>
            <button
              onClick={fetchUpcomingTasks}
              className="mt-4 text-sm px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Refresh
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task, index) => {
          const priorityInfo = getPriorityInfo(task.priority)
          const dueSoon = isDueSoon(task.due_date)
          const overdue = isOverdue(task.due_date)
          
          return (
            <div
              key={task.task_id || index}
              className={`flex items-start gap-3 rounded-lg border ${
                overdue 
                  ? 'border-red-200 bg-red-50' 
                  : dueSoon 
                    ? 'border-amber-200 bg-amber-50' 
                    : 'border-gray-200 bg-gray-50'
              } p-3 transition-colors`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900">
                  {task.task_name}
                </div>
                
                {(task.campaign_name || task.brand_name) && (
                  <div className="flex items-center gap-2 mt-1">
                    {task.campaign_name && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {task.campaign_name}
                      </span>
                    )}
                    {task.brand_name && (
                      <span className="text-xs text-gray-600">
                        {task.brand_name}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="mt-2 flex items-center gap-2">
                  <Badge
                    variant={priorityInfo.variant}
                    className={priorityInfo.className}
                  >
                    {priorityInfo.label}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-xs">
                    {overdue ? (
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    ) : dueSoon ? (
                      <Clock className="h-3 w-3 text-amber-500" />
                    ) : (
                      <Calendar className="h-3 w-3 text-gray-500" />
                    )}
                    <span className={
                      overdue 
                        ? 'text-red-600 font-medium' 
                        : dueSoon 
                          ? 'text-amber-600 font-medium' 
                          : 'text-gray-500'
                    }>
                      {formatDate(task.due_date)}
                      {overdue && ' (Overdue)'}
                      {dueSoon && !overdue && ' (Due soon)'}
                    </span>
                  </div>
                  
                  {/* Task description if available */}
                  {task.task_description && (
                    <div className="ml-auto">
                      <span className="text-xs text-gray-400" title={task.task_description}>
                        ℹ️
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}