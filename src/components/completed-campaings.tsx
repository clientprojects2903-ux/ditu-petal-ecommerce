'use client'
import { CheckCircle2, Calendar, Package, AlertCircle, User } from "lucide-react"
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
  variant?: "default" | "secondary" | "outline" | "success" | "warning"
  className?: string
}

const Badge = ({ children, variant = "default", className = "" }: BadgeProps) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  
  const variantClasses = {
    default: "bg-blue-100 text-blue-700",
    secondary: "bg-gray-100 text-gray-700",
    outline: "border border-gray-300 bg-white",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700"
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
  campaign_budget: number | null
  campaign_content_type: any // jsonb
  campaign_timeline_start: string | null
  campaign_timeline_end: string | null
  minimum_followers: number | null
  minimum_subscribers: number | null
  campaign_niche: string | null
  created_at: string
  updated_at: string
  admin_status: string | null  // Added admin_status
}

// CompletedCampaigns Component
export function CompletedCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredCampaign, setHoveredCampaign] = useState<number | null>(null)

  useEffect(() => {
    fetchCompletedCampaigns()
  }, [])

  const fetchCompletedCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError("Please log in to view completed campaigns")
        setLoading(false)
        return
      }

      // 2. Fetch completed campaigns for this influencer
      // Using contains for array and including admin_status in status check
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .contains('influencer_id', [user.id])  // Fixed: using contains for array
        .or('status.in.(completed,finished),admin_status.eq.completed')  // Check both status and admin_status
        .order('updated_at', { ascending: false })
        .limit(5)

      if (campaignsError) {
        console.error("Error fetching campaigns:", campaignsError)
        setError("Failed to load completed campaigns")
        setLoading(false)
        return
      }

      console.log("Completed campaigns fetched:", campaignsData)
      setCampaigns(campaignsData || [])

    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date"
    
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get content types from jsonb
  const getContentTypes = (campaign: Campaign): string => {
    if (!campaign.campaign_content_type) return "Various content"
    
    try {
      const contentTypes = campaign.campaign_content_type
      if (Array.isArray(contentTypes)) {
        return contentTypes.slice(0, 3).join(", ")
      }
      return "Various content"
    } catch {
      return "Various content"
    }
  }

  // Get niche or fallback
  const getNiche = (campaign: Campaign): string => {
    return campaign.campaign_niche || "General"
  }

  // Get brand initials
  const getBrandInitials = (brandId: string): string => {
    return brandId.substring(0, 2).toUpperCase()
  }

  // Get brand color based on ID
  const getBrandColor = (brandId: string): { bg: string; text: string } => {
    const colors = [
      { bg: "bg-blue-100", text: "text-blue-700" },
      { bg: "bg-emerald-100", text: "text-emerald-700" },
      { bg: "bg-violet-100", text: "text-violet-700" },
      { bg: "bg-amber-100", text: "text-amber-700" },
      { bg: "bg-rose-100", text: "text-rose-700" },
      { bg: "bg-cyan-100", text: "text-cyan-700" },
    ]
    
    // Generate consistent color based on brandId
    let hash = 0
    for (let i = 0; i < brandId.length; i++) {
      hash = brandId.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  const handleCampaignClick = (campaignId: number) => {
    console.log(`Clicked campaign ${campaignId}`)
    // Implement campaign detail view logic here
  }

  // Handle loading state
  if (loading) {
    return (
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900">Completed Campaigns</CardTitle>
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
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
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
          <CardTitle>Completed Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <p className="text-gray-600 mb-2">{error}</p>
            <button
              onClick={fetchCompletedCampaigns}
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
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Completed Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 mb-2">No completed campaigns yet</p>
            <p className="text-sm text-gray-500">Campaigns you've completed will appear here</p>
            <button
              onClick={fetchCompletedCampaigns}
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
        <CardTitle className="text-lg font-semibold text-gray-900">Completed Campaigns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {campaigns.map((campaign) => {
          const brandColor = getBrandColor(campaign.brand_id)
          const brandInitials = getBrandInitials(campaign.brand_id)
          const contentTypes = getContentTypes(campaign)
          
          return (
            <div
              key={campaign.campaign_id}
              className={`flex items-center gap-4 rounded-lg border ${
                hoveredCampaign === campaign.campaign_id 
                  ? 'border-emerald-200 bg-emerald-50' 
                  : 'border-gray-200 bg-gray-50'
              } p-4 transition-all duration-200 cursor-pointer hover:shadow-sm`}
              onMouseEnter={() => setHoveredCampaign(campaign.campaign_id)}
              onMouseLeave={() => setHoveredCampaign(null)}
              onClick={() => handleCampaignClick(campaign.campaign_id)}
            >
              {/* Brand Avatar */}
              <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg font-semibold text-sm ${brandColor.bg} ${brandColor.text}`}>
                {brandInitials}
              </div>
              
              {/* Campaign Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 
                    className="font-medium text-gray-900 truncate"
                    title={campaign.campaign_name}
                  >
                    {campaign.campaign_name}
                  </h4>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                </div>
                
                {/* Campaign Description */}
                {campaign.campaign_description && (
                  <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                    {campaign.campaign_description}
                  </p>
                )}
                
                {/* Campaign Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-gray-400" />
                    <span>{contentTypes}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-400" />
                    <span>{getNiche(campaign)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span>Completed: {formatDate(campaign.updated_at)}</span>
                  </div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="text-right flex-shrink-0">
                <Badge 
                  variant="success" 
                  className="bg-emerald-100 text-emerald-700"
                >
                  Completed
                </Badge>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}