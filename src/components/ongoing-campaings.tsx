'use client'
import { ArrowRight, Calendar, Target, FileText, Clock, AlertCircle } from "lucide-react"
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
  variant?: "default" | "secondary" | "outline" | "destructive" | "warning"
  className?: string
}

const Badge = ({ children, variant = "default", className = "" }: BadgeProps) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
  
  const variantClasses = {
    default: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    secondary: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    destructive: "bg-red-100 text-red-700 hover:bg-red-100",
    warning: "bg-amber-100 text-amber-700 hover:bg-amber-100"
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Campaign Interface based on your schema
interface Campaign {
  campaign_id: number
  campaign_name: string
  campaign_description: string | null
  brand_id: string
  influencer_id: string[] | null  // Changed to array
  status: string | null
  admin_status: string | null  // Added admin_status
  campaign_timeline_start: string | null
  campaign_timeline_end: string | null
  created_at: string
  // We'll join with users table to get brand info
  brand?: {
    full_name?: string
    email?: string
    profile_image_url?: string
  }
}

// Extended interface with calculated values
interface CampaignWithProgress extends Campaign {
  daysRemaining: number
  isOverdue: boolean
  brandInitials: string
  brandColor: string
}

// OngoingCampaigns Component
export function OngoingCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredCampaign, setHoveredCampaign] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchOngoingCampaigns()
  }, [])

  const fetchOngoingCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError("Please log in to view campaigns")
        setLoading(false)
        return
      }

      setUserId(user.id)

      // 2. Fetch ongoing campaigns for this influencer (using array containment)
      // We consider campaigns as "ongoing" if they're not completed/cancelled
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          campaign_id,
          campaign_name,
          campaign_description,
          brand_id,
          influencer_id,
          status,
          admin_status,
          campaign_timeline_start,
          campaign_timeline_end,
          created_at
        `)
        .contains('influencer_id', [user.id])  // Fixed: using contains for array
        .in('status', ['active', 'pending', 'in_progress', 'assigned', 'started'])
        .order('created_at', { ascending: false })
        .limit(5)

      if (campaignsError) {
        console.error("Error fetching campaigns:", campaignsError)
        setError("Failed to load campaigns")
        setLoading(false)
        return
      }

      console.log("Fetched campaigns:", campaignsData)

      // 3. Get brand details for each campaign
      const campaignsWithBrands = await Promise.all(
        (campaignsData || []).map(async (campaign) => {
          // Fetch brand details from users table
          const { data: brandData } = await supabase
            .from('users')
            .select('full_name, email, profile_image_url')
            .eq('id', campaign.brand_id)
            .single()

          // Calculate days remaining
          const daysRemaining = calculateDaysRemaining(campaign.campaign_timeline_end)
          
          // Check if overdue
          const isOverdue = daysRemaining < 0
          
          // Get brand initials for avatar
          const brandName = brandData?.full_name || brandData?.email || campaign.brand_id
          const brandInitials = getInitials(brandName)
          
          // Get consistent brand color
          const brandColor = getBrandColor(campaign.brand_id)

          return {
            ...campaign,
            brand: brandData || {},
            daysRemaining: Math.abs(daysRemaining),
            isOverdue,
            brandInitials,
            brandColor
          }
        })
      )

      setCampaigns(campaignsWithBrands as CampaignWithProgress[])
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Calculate days remaining until deadline
  const calculateDaysRemaining = (deadline: string | null): number => {
    if (!deadline) return 0
    
    const endDate = new Date(deadline)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Get initials from name/email
  const getInitials = (text: string): string => {
    if (!text) return "??"
    
    return text
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Get consistent color for a brand
  const getBrandColor = (brandId: string): string => {
    // Generate a consistent color based on brandId
    const colors = [
      "bg-pink-500 text-white",
      "bg-blue-500 text-white", 
      "bg-green-500 text-white",
      "bg-purple-500 text-white",
      "bg-orange-500 text-white",
      "bg-teal-500 text-white",
      "bg-red-500 text-white",
      "bg-indigo-500 text-white",
    ]
    
    // Simple hash function to get consistent index
    let hash = 0
    for (let i = 0; i < brandId.length; i++) {
      hash = brandId.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  // Get status badge info (considering both status and admin_status)
  const getStatusInfo = (status: string | null, adminStatus: string | null) => {
    // First check admin_status as it might override
    if (adminStatus?.toLowerCase() === 'rejected') {
      return { variant: 'destructive' as const, label: 'Rejected', className: 'bg-red-100 text-red-700' }
    }
    if (adminStatus?.toLowerCase() === 'approved') {
      return { variant: 'secondary' as const, label: 'Approved', className: 'bg-blue-100 text-blue-700' }
    }
    if (adminStatus?.toLowerCase() === 'completed') {
      return { variant: 'default' as const, label: 'Completed', className: 'bg-emerald-100 text-emerald-700' }
    }

    // Then check regular status
    switch (status?.toLowerCase()) {
      case 'pending':
        return { variant: 'warning' as const, label: 'Pending', className: 'bg-amber-100 text-amber-700' }
      case 'in_progress':
        return { variant: 'default' as const, label: 'In Progress', className: 'bg-emerald-100 text-emerald-700' }
      case 'active':
        return { variant: 'default' as const, label: 'Active', className: 'bg-emerald-100 text-emerald-700' }
      case 'assigned':
        return { variant: 'secondary' as const, label: 'Assigned', className: 'bg-indigo-100 text-indigo-700' }
      case 'started':
        return { variant: 'secondary' as const, label: 'Started', className: 'bg-blue-100 text-blue-700' }
      default:
        return { variant: 'outline' as const, label: status || 'Unknown', className: 'bg-gray-100 text-gray-700' }
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline"
    
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Handle empty state
  if (loading) {
    return (
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900">Ongoing Campaigns</CardTitle>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
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
          <CardTitle>Ongoing Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <p className="text-gray-600 mb-2">{error}</p>
            <button
              onClick={fetchOngoingCampaigns}
              className="text-sm px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (campaigns.length === 0) {
    return (
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900">Ongoing Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 mb-2">No ongoing campaigns</p>
            <p className="text-sm text-gray-500">Campaigns you're currently working on will appear here</p>
            <button
              onClick={fetchOngoingCampaigns}
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900">Ongoing Campaigns</CardTitle>
        <button 
          onClick={() => console.log("View all campaigns")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
        >
          View all <ArrowRight className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        {campaigns.map((campaign) => {
          const statusInfo = getStatusInfo(campaign.status, campaign.admin_status)
          const brandName = campaign.brand?.full_name || campaign.brand?.email || `Brand ${campaign.brand_id.substring(0, 8)}`
          
          return (
            <div
              key={campaign.campaign_id}
              className={`flex items-center gap-4 rounded-lg border ${
                hoveredCampaign === campaign.campaign_id 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50'
              } p-4 transition-all duration-200 cursor-pointer hover:shadow-sm`}
              onMouseEnter={() => setHoveredCampaign(campaign.campaign_id)}
              onMouseLeave={() => setHoveredCampaign(null)}
              onClick={() => console.log("View campaign details:", campaign.campaign_id)}
            >
              {/* Brand Avatar */}
              <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg font-semibold text-sm ${campaign.brandColor}`}>
                {campaign.brandInitials}
              </div>

              {/* Campaign Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate" title={campaign.campaign_name}>
                    {campaign.campaign_name}
                  </h4>
                  <Badge
                    variant={statusInfo.variant}
                    className={statusInfo.className}
                  >
                    {statusInfo.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span className="truncate" title={brandName}>
                    {brandName}
                  </span>
                  {campaign.isOverdue && (
                    <Badge variant="destructive" className="text-xs">
                      Overdue
                    </Badge>
                  )}
                </div>

                {/* Campaign Info */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Due: {formatDate(campaign.campaign_timeline_end)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {campaign.isOverdue ? (
                        <span className="text-red-600 font-medium">
                          {campaign.daysRemaining} days overdue
                        </span>
                      ) : (
                        <span className="text-gray-600">
                          {campaign.daysRemaining} days left
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Campaign Description (truncated) */}
                {campaign.campaign_description && (
                  <div className="mt-3 flex items-start gap-1">
                    <FileText className="h-3 w-3 mt-0.5 text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {campaign.campaign_description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}