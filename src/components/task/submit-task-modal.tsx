"use client"

import { useState } from "react"
import { Plus, Trash2, Link, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SubmitTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskTitle: string
  taskId: string // Changed from number to string
  campaignId: number | null
  assignedTo: string
  onSubmit: (data: { links: string[]; comments: string }) => void
  onSuccess?: () => void
}

export function SubmitTaskModal({ 
  open, 
  onOpenChange, 
  taskTitle, 
  taskId,
  campaignId,
  assignedTo,
  onSubmit, 
  onSuccess 
}: SubmitTaskModalProps) {
  const [links, setLinks] = useState<string[]>([""])
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const addLink = () => {
    setLinks([...links, ""])
  }

  const removeLink = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index))
    }
  }

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links]
    newLinks[index] = value
    setLinks(newLinks)
  }

  const handleSubmit = async () => {
    const validLinks = links.filter((link) => link.trim() !== "")
    
    if (validLinks.length === 0) {
      setError("Please add at least one link")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      
      if (!user) {
        throw new Error("You must be logged in to submit a task")
      }

      // Convert string ID to number for database query
      const taskIdNum = parseInt(taskId, 10)
      
      if (isNaN(taskIdNum)) {
        throw new Error("Invalid task ID")
      }

      // Verify the user is assigned to this task by checking the database
      const { data: taskCheck, error: taskCheckError } = await supabase
        .from('tasks')
        .select('assigned_to')
        .eq('task_id', taskIdNum) // Use number ID for database
        .single()

      if (taskCheckError) throw taskCheckError

      if (user.id !== taskCheck.assigned_to) {
        throw new Error("You are not authorized to submit this task")
      }

      // Update the task in the database
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          links: validLinks,
          comments: comments.trim() || null,
          completed: true,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('task_id', taskIdNum) // Use number ID for database
        .eq('assigned_to', user.id)

      if (updateError) throw updateError

      // Call the original onSubmit prop
      onSubmit({ links: validLinks, comments })
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Reset form and close modal
      setLinks([""])
      setComments("")
      onOpenChange(false)
      
    } catch (err) {
      console.error('Error submitting task:', err)
      setError(err instanceof Error ? err.message : "Failed to submit task. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = links.some((link) => link.trim() !== "")

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-card border border-border rounded-lg w-full max-w-lg mx-4 shadow-lg">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Submit Task</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Submit your deliverables for "{taskTitle}"
          </p>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Deliverable Links <span className="text-destructive">*</span>
            </label>
            {links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <div className="relative flex-1">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://instagram.com/p/..."
                    value={link}
                    onChange={(e) => updateLink(index, e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    disabled={isSubmitting}
                  />
                </div>
                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="px-3 border border-border rounded-md text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addLink}
              className="px-3 py-1.5 border border-border rounded-md text-sm text-muted-foreground hover:bg-secondary/50 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another Link
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Comments (Optional)</label>
            <textarea
              placeholder="Add any notes or comments for the brand..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-secondary/50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Task
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}