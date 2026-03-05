"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function CreateCampaignPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    brand_id: undefined as number | undefined,
    campaign_name: "",
    campaign_description: "",
    campaign_budget: undefined as number | undefined,
    campaign_content_type: [] as string[],
    campaign_timeline_start: undefined as string | undefined,
    campaign_timeline_end: undefined as string | undefined,
    minimum_followers: 0,
    minimum_subscribers: 0,
    campaign_niche: "",
    status: "pending",
  })

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Get current user on component mount
  useEffect(() => {
    const getUser = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }
        
        if (!session?.user) {
          router.push("/login")
          return
        }
        
        const currentUser = session.user
        setUserId(currentUser.id)
        
        // Check if user exists in users table and get their role
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, role, email')
          .eq('id', currentUser.id)
          .single()
          
        if (userError) {
          console.error("User error:", userError)
          throw new Error("User not found in database")
        }
        
        setUserRole(user.role)
        
        // Check if user has brand role
        if (user.role !== 'brand') {
          setError("Only brand accounts can create campaigns")
          return
        }
        
        // Convert UUID to integer for brand_id
        const uuidAsInt = parseInt(currentUser.id.replace(/[^0-9]/g, '').slice(0, 9), 10)
        setFormData(prev => ({ ...prev, brand_id: uuidAsInt }))
        
      } catch (error) {
        console.error("Error fetching user:", error)
        setError(error instanceof Error ? error.message : "Failed to load user data. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
  }, [supabase, router])

  const handleContentTypeChange = (value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      campaign_content_type: checked
        ? [...(prev.campaign_content_type || []), value]
        : (prev.campaign_content_type || []).filter((t) => t !== value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) {
      setError("You must be logged in to create a campaign")
      return
    }
    
    if (userRole !== 'brand') {
      setError("Only brand accounts can create campaigns")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate required fields
      if (!formData.campaign_name.trim()) {
        throw new Error("Campaign name is required")
      }
      
      if (!formData.brand_id) {
        throw new Error("Brand ID is required")
      }
      
      // Validate dates
      const startDateStr = startDate ? format(startDate, "yyyy-MM-dd") : null
      const endDateStr = endDate ? format(endDate, "yyyy-MM-dd") : null
      
      if (startDateStr && endDateStr && new Date(startDateStr) > new Date(endDateStr)) {
        throw new Error("Start date must be before end date")
      }
      
      // Prepare campaign data for Supabase
      const campaignData = {
        brand_id: formData.brand_id,
        campaign_name: formData.campaign_name.trim(),
        campaign_description: formData.campaign_description.trim() || null,
        campaign_budget: formData.campaign_budget || null,
        campaign_content_type: formData.campaign_content_type.length > 0 ? formData.campaign_content_type : null,
        campaign_timeline_start: startDateStr,
        campaign_timeline_end: endDateStr,
        minimum_followers: formData.minimum_followers || 0,
        minimum_subscribers: formData.minimum_subscribers || 0,
        campaign_niche: formData.campaign_niche.trim() || null,
        status: formData.status || "pending",
      }

      // Insert campaign into Supabase
      const { data, error: insertError } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select()
        .single()

      if (insertError) {
        console.error("Supabase insert error:", insertError)
        
        // Handle specific error cases
        if (insertError.code === '23503') {
          throw new Error("Invalid brand ID. Please contact support.")
        } else if (insertError.code === '23505') {
          throw new Error("A campaign with this name already exists.")
        } else {
          throw new Error(`Failed to create campaign: ${insertError.message}`)
        }
      }
      
      // Show success message
      setSuccess("Campaign created successfully!")
      
      // Reset form
      setFormData({
        brand_id: formData.brand_id,
        campaign_name: "",
        campaign_description: "",
        campaign_budget: undefined,
        campaign_content_type: [],
        campaign_timeline_start: undefined,
        campaign_timeline_end: undefined,
        minimum_followers: 0,
        minimum_subscribers: 0,
        campaign_niche: "",
        status: "pending",
      })
      setStartDate(undefined)
      setEndDate(undefined)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/brand/campaigns")
      }, 2000)
      
    } catch (error) {
      console.error("Error creating campaign:", error)
      setError(error instanceof Error ? error.message : "Failed to create campaign. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (error && error.includes("Only brand accounts")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </button>
              <button 
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-blue-500 text-4xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to create a campaign.</p>
            <button 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => router.push("/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
            <p className="text-gray-600 mt-2">Fill in the details below to launch your influencer campaign</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Role: <span className="font-medium">{userRole}</span>
            </span>
            <button 
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Dashboard
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                  <p className="text-sm text-green-700 mt-1">Redirecting to campaigns page...</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Basic Information Card */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="campaign_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  id="campaign_name"
                  type="text"
                  placeholder="Summer 2024 Fashion Campaign"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, campaign_name: e.target.value }))}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="campaign_description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="campaign_description"
                  placeholder="Describe your campaign objectives, target audience, and specific requirements for influencers..."
                  rows={4}
                  value={formData.campaign_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, campaign_description: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="campaign_niche" className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Niche
                  </label>
                  <select
                    id="campaign_niche"
                    value={formData.campaign_niche}
                    onChange={(e) => setFormData((prev) => ({ ...prev, campaign_niche: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="">Select a niche</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="beauty">Beauty & Cosmetics</option>
                    <option value="fitness">Fitness & Wellness</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="travel">Travel & Adventure</option>
                    <option value="food">Food & Beverage</option>
                    <option value="technology">Technology</option>
                    <option value="gaming">Gaming & Esports</option>
                    <option value="education">Education</option>
                    <option value="business">Business & Finance</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="pending">Draft / Pending</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Budget & Timeline Card */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Budget & Timeline</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="campaign_budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Budget ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    id="campaign_budget"
                    type="number"
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    value={formData.campaign_budget || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        campaign_budget: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                      }))
                    }
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                    disabled={isSubmitting}
                    min={startDate ? format(startDate, "yyyy-MM-dd") : undefined}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Types Card */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Content Types</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { value: "instagram_post", label: "Instagram Post" },
                { value: "instagram_story", label: "Instagram Story" },
                { value: "instagram_reel", label: "Instagram Reel" },
                { value: "tiktok_video", label: "TikTok Video" },
                { value: "youtube_video", label: "YouTube Video" },
                { value: "youtube_short", label: "YouTube Short" },
                { value: "blog_post", label: "Blog Post" },
                { value: "twitter_thread", label: "Twitter Thread" },
                { value: "linkedin_post", label: "LinkedIn Post" },
                { value: "product_review", label: "Product Review" }
              ].map((type) => (
                <div key={type.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={type.value}
                    checked={formData.campaign_content_type?.includes(type.value)}
                    onChange={(e) => handleContentTypeChange(type.value, e.target.checked)}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={type.value}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements Card */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Influencer Requirements</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="minimum_followers" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Followers
                </label>
                <input
                  id="minimum_followers"
                  type="number"
                  placeholder="1000"
                  min={0}
                  value={formData.minimum_followers || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minimum_followers: Number.parseInt(e.target.value) || 0,
                    }))
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
                <p className="mt-2 text-sm text-gray-500">For Instagram, TikTok, Twitter, etc.</p>
              </div>

              <div>
                <label htmlFor="minimum_subscribers" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Subscribers
                </label>
                <input
                  id="minimum_subscribers"
                  type="number"
                  placeholder="500"
                  min={0}
                  value={formData.minimum_subscribers || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minimum_subscribers: Number.parseInt(e.target.value) || 0,
                    }))
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
                <p className="mt-2 text-sm text-gray-500">For YouTube channels</p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !userId || userRole !== 'brand'}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creating Campaign..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
