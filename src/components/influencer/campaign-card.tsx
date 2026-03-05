"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Calendar, DollarSign, Instagram, Youtube, Clock, CheckCircle2, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export interface Campaign {
  campaign_id: number
  brand_id: string
  campaign_name: string
  campaign_description: string | null
  campaign_budget: number | null
  campaign_content_type: any
  campaign_timeline_start: string | null
  campaign_timeline_end: string | null
  minimum_followers: number
  minimum_subscribers: number
  campaign_niche: string | null
  status: string
  admin_status: string
  selection_type: 'application_select' | 'self_select' | 'managed'
  brand?: {
    id: string
    full_name: string
    profile_image_url: string | null
  }
}

// Platform mapping based on content_type
const getPlatformFromContentType = (contentType: any): string => {
  if (!contentType) return "Multiple"
  
  if (Array.isArray(contentType)) {
    if (contentType.includes('instagram')) return "Instagram"
    if (contentType.includes('youtube')) return "YouTube"
    if (contentType.includes('tiktok')) return "TikTok"
  }
  
  return "Multiple"
}

const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4 flex-shrink-0" />,
  YouTube: <Youtube className="h-4 w-4 flex-shrink-0" />,
  TikTok: (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
  Multiple: (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
}

// Helper function to format currency in INR
const formatINR = (amount: number | null): string => {
  if (amount === null) return "₹0"
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Apply Dialog Component - Updated to match new schema
function ApplyDialog({ 
  open, 
  onOpenChange, 
  campaign,
  onApplicationSuccess 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  campaign: Campaign,
  onApplicationSuccess: () => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error("Please sign in to apply")
      }

      // Check if user is an influencer
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userDataError || userData?.role !== 'influencer') {
        throw new Error("Only influencers can apply to campaigns")
      }

      // Check if already applied
      const { data: existingApplication, error: checkError } = await supabase
        .from('applications')
        .select('application_id')
        .eq('campaign_id', campaign.campaign_id)
        .eq('influencer_id', user.id)
        .maybeSingle()

      if (existingApplication) {
        throw new Error("You have already applied to this campaign")
      }

      // Submit application with new schema
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          influencer_id: user.id,
          campaign_id: campaign.campaign_id,
          brand_id: campaign.brand_id,
          status: 'pending'
        })

      if (applicationError) {
        console.error('Application error:', applicationError)
        throw applicationError
      }

      // Call success callback
      onApplicationSuccess()
      setIsSubmitted(true)
    } catch (error: any) {
      alert(error.message || "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setIsSubmitted(false)
    }, 200)
  }

  if (!open) return null

  // Success state
  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="flex flex-col items-center justify-center py-8 text-center px-6">
            <div className="rounded-full bg-[#87599a]/10 p-3">
              <CheckCircle2 className="h-8 w-8 text-[#87599a]" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Application Submitted!</h3>
            <p className="mt-2 text-gray-600">
              Your application for <span className="font-medium text-gray-900">{campaign.campaign_name}</span> has been
              submitted successfully.
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {campaign.brand?.full_name || 'The brand'} will review your application and get back to you soon.
            </p>
            <button 
              onClick={handleClose}
              className="mt-6 px-4 py-2 bg-[#87599a] text-white font-medium rounded-md hover:bg-[#6b4b7a] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Get brand logo URL
  const brandLogo = campaign.brand?.profile_image_url

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full mx-4">
        <div className="p-6 border-b border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900">Confirm Application</h2>
          <p className="text-gray-600 mt-1">Review your application details before submitting.</p>
        </div>

        <div className="p-6 border-b border-gray-300">
          <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              {/* Brand Logo */}
              <div className="h-10 w-10 rounded-lg bg-[#87599a]/10 flex items-center justify-center text-[#87599a] font-semibold flex-shrink-0 overflow-hidden">
                {brandLogo ? (
                  <img 
                    src={brandLogo} 
                    alt={campaign.brand?.full_name || 'Brand'} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback to initial if image fails to load
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center')
                      const fallback = document.createElement('span')
                      fallback.className = 'text-[#87599a] font-semibold'
                      fallback.textContent = campaign.brand?.full_name?.charAt(0).toUpperCase() || 'B'
                      e.currentTarget.parentElement?.appendChild(fallback)
                    }}
                  />
                ) : (
                  <span>{campaign.brand?.full_name?.charAt(0).toUpperCase() || 'B'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 truncate">{campaign.brand?.full_name || 'Brand'}</p>
                <p className="font-medium text-gray-900 break-words">{campaign.campaign_name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {campaign.campaign_budget && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700">
                      {formatINR(campaign.campaign_budget)}
                    </span>
                  )}
                  {campaign.campaign_timeline_end && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700">
                      <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                      Due{" "}
                      {new Date(campaign.campaign_timeline_end).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Campaign Requirements</label>
              <ul className="space-y-1">
                {campaign.minimum_followers > 0 && (
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-[#87599a] flex-shrink-0" />
                    <span>Minimum {campaign.minimum_followers.toLocaleString()} followers</span>
                  </li>
                )}
                {campaign.minimum_subscribers > 0 && (
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-[#87599a] flex-shrink-0" />
                    <span>Minimum {campaign.minimum_subscribers.toLocaleString()} subscribers</span>
                  </li>
                )}
                {campaign.campaign_niche && (
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-[#87599a] flex-shrink-0" />
                    <span>{campaign.campaign_niche} niche</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-md bg-[#87599a]/5 p-4">
              <p className="text-sm text-[#87599a]">
                By submitting this application, you confirm that you meet the campaign requirements and are interested in collaborating with {campaign.brand?.full_name || 'this brand'}.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#87599a] text-white rounded-md hover:bg-[#6b4b7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Confirm Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main CampaignCard Component with optimistic updates
export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [userHasApplied, setUserHasApplied] = useState(false)
  const [loadingApplicationStatus, setLoadingApplicationStatus] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    checkIfUserApplied()
  }, [])

  const checkIfUserApplied = async () => {
    try {
      setLoadingApplicationStatus(true)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setUserHasApplied(false)
        return
      }

      const { data, error } = await supabase
        .from('applications')
        .select('application_id')
        .eq('campaign_id', campaign.campaign_id)
        .eq('influencer_id', user.id)
        .maybeSingle()

      if (error) {
        console.error("Error checking application status:", error)
        setUserHasApplied(false)
      } else {
        setUserHasApplied(!!data)
      }
    } catch (error) {
      console.error("Error in checkIfUserApplied:", error)
      setUserHasApplied(false)
    } finally {
      setLoadingApplicationStatus(false)
    }
  }

  // Optimistic update handler
  const handleApplicationSuccess = () => {
    setUserHasApplied(true)
    setIsApplying(false)
    setShowApplyDialog(false)
  }

  const handleApplyClick = async () => {
    if (userHasApplied) return
    
    try {
      setIsApplying(true)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setIsApplying(false)
        alert("Please sign in to apply to campaigns")
        return
      }

      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userDataError || userData?.role !== 'influencer') {
        setIsApplying(false)
        alert("Only influencers can apply to campaigns")
        return
      }

      const { data: existingApp, error: checkError } = await supabase
        .from('applications')
        .select('application_id')
        .eq('campaign_id', campaign.campaign_id)
        .eq('influencer_id', user.id)
        .maybeSingle()

      if (existingApp) {
        setUserHasApplied(true)
        setIsApplying(false)
        alert("You have already applied to this campaign")
        return
      }

      setShowApplyDialog(true)
      setIsApplying(false)
    } catch (error: any) {
      console.error("Error in handleApplyClick:", error)
      setIsApplying(false)
      alert(error.message || "An error occurred")
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const daysUntilDeadline = () => {
    if (!campaign.campaign_timeline_end) return null
    const deadline = new Date(campaign.campaign_timeline_end)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const days = daysUntilDeadline()
  const platform = getPlatformFromContentType(campaign.campaign_content_type)
  const brandLogo = campaign.brand?.profile_image_url
  const brandInitial = campaign.brand?.full_name?.charAt(0).toUpperCase() || 'B'

  // Only show if campaign is application_select type
  if (campaign.selection_type !== 'application_select') {
    return null
  }

  return (
    <>
      <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-white transition-all hover:shadow-lg hover:border-[#87599a]">
        {/* Card Header */}
        <div className="p-6 pb-3">
          <div className="flex items-start gap-3">
            {/* Brand Logo with fallback */}
            <div className="h-10 w-10 rounded-lg bg-[#87599a]/10 flex items-center justify-center text-[#87599a] font-semibold flex-shrink-0 overflow-hidden">
              {brandLogo && !imageError ? (
                <img 
                  src={brandLogo} 
                  alt={campaign.brand?.full_name || 'Brand'} 
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span>{brandInitial}</span>
              )}
            </div>
            
            {/* Brand and Campaign Name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                {campaign.brand?.full_name || 'Brand'}
              </p>
              <h3 className="font-semibold leading-tight text-gray-900 break-words">
                {campaign.campaign_name}
              </h3>
            </div>

            {/* Badges */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {userHasApplied && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 whitespace-nowrap">
                  <CheckCircle className="h-3 w-3 flex-shrink-0" />
                  <span>Applied</span>
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 whitespace-nowrap">
                Open
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
              {platformIcons[platform]}
              <span>{platform}</span>
            </span>
            {campaign.campaign_niche && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700">
                {campaign.campaign_niche}
              </span>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 pt-0 space-y-4 flex-1">
          <p className="text-sm text-gray-600 line-clamp-3 break-words">
            {campaign.campaign_description || 'No description provided.'}
          </p>

          <div className="space-y-2">
            {campaign.campaign_budget && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="font-medium text-gray-900 break-words">
                  Budget: {formatINR(campaign.campaign_budget)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500 break-words">
                {campaign.campaign_timeline_end ? `Deadline: ${formatDate(campaign.campaign_timeline_end)}` : 'No deadline'}
              </span>
              {days && days > 0 && days <= 7 && (
                <span className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 whitespace-nowrap flex-shrink-0">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  {days} days left
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Requirements</p>
            <div className="space-y-1">
              {campaign.minimum_followers > 0 && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-3 w-3 text-[#87599a] flex-shrink-0 mt-0.5" />
                  <span className="break-words">Min. {campaign.minimum_followers.toLocaleString()} followers</span>
                </div>
              )}
              {campaign.minimum_subscribers > 0 && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-3 w-3 text-[#87599a] flex-shrink-0 mt-0.5" />
                  <span className="break-words">Min. {campaign.minimum_subscribers.toLocaleString()} subscribers</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-6 pt-4 border-t border-gray-300 bg-gray-50">
          {loadingApplicationStatus ? (
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          ) : userHasApplied ? (
            <button 
              disabled
              className="w-full px-4 py-2 bg-green-100 text-green-800 font-medium rounded-md border border-green-200 flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Already Applied</span>
            </button>
          ) : isApplying ? (
            <button 
              disabled
              className="w-full px-4 py-2 bg-[#87599a] text-white font-medium rounded-md flex items-center justify-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
              <span>Processing...</span>
            </button>
          ) : (
            <button 
              onClick={handleApplyClick}
              className="w-full px-4 py-2 bg-[#87599a] text-white font-medium rounded-md hover:bg-[#6b4b7a] transition-colors"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>

      {/* Apply Dialog */}
      <ApplyDialog 
        open={showApplyDialog} 
        onOpenChange={setShowApplyDialog} 
        campaign={campaign} 
        onApplicationSuccess={handleApplicationSuccess}
      />
    </>
  )
}