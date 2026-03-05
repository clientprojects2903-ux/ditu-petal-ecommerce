'use client'

import { TrendingUp, Clock, CheckCircle2, Briefcase } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

// Card Component - unchanged
interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const Card = ({ children, className = "", onClick }: CardProps) => {
  return (
    <div 
      className={`rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer hover:border-gray-300' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// CardContent Component - unchanged
interface CardContentProps {
  children: React.ReactNode
  className?: string
}

const CardContent = ({ children, className = "" }: CardContentProps) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

// StatCard Component - updated color scheme to #87599a
interface StatCardProps {
  title: string
  value: string | number
  change: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  iconBg: string
  onClick?: () => void
  loading?: boolean
}

const StatCard = ({ title, value, change, icon: Icon, color, iconBg, onClick, loading = false }: StatCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className={`h-12 w-12 rounded-xl ${iconBg} ${color} animate-pulse`}></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
            <p className="mt-1 text-xs font-medium text-emerald-600">{change}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Campaign Stats Interface
interface CampaignStats {
  totalCampaigns: number
  ongoingCampaigns: number
  completedCampaigns: number
  uniqueBrands: number
}

// StatsOverview Component - FIXED VERSION with array containment query
export function StatsOverview() {
  const [stats, setStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    ongoingCampaigns: 0,
    completedCampaigns: 0,
    uniqueBrands: 0
  })
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    fetchUserAndCampaigns()
  }, [])

  const fetchUserAndCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 1. Fetch current logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error("Error fetching user:", userError)
        setError(`Authentication error: ${userError.message}`)
        setLoading(false)
        return
      }
      
      if (!user) {
        console.error("No user found - user might not be logged in")
        setError("Please log in to view your campaign statistics.")
        setLoading(false)
        return
      }
      
      console.log("User ID:", user.id)
      console.log("User email:", user.email)
      setUserId(user.id)
      setUserEmail(user.email || null)

      // 2. Fetch campaigns where the influencer_id array contains the user's ID
      // IMPORTANT: Include admin_status in the select query
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          campaign_id, 
          status, 
          brand_id, 
          created_at, 
          influencer_id,
          admin_status
        `)
        .contains('influencer_id', [user.id]) // Check if array contains user.id
      
      console.log("Campaigns query result:", { campaigns, campaignsError })
      
      if (campaignsError) {
        console.error("Error fetching campaigns:", campaignsError)
        setError(`Database error: ${campaignsError.message}`)
        setLoading(false)
        return
      }
      
      // Debug: Check what we got
      console.log("Number of campaigns found:", campaigns?.length || 0)
      
      if (campaigns && campaigns.length > 0) {
        console.log("First campaign:", campaigns[0])
        console.log("All statuses:", campaigns.map(c => c.status))
        console.log("All admin_statuses:", campaigns.map(c => c.admin_status))
      }
      
      // 3. Calculate stats - considering both status and admin_status
      const totalCampaigns = campaigns?.length || 0
      
      // Calculate ongoing campaigns (consider both status and admin_status)
      const ongoingCampaigns = campaigns?.filter(campaign => {
        const status = campaign.status?.toLowerCase()
        const adminStatus = campaign.admin_status?.toLowerCase()
        
        // Consider admin_status first if it's more restrictive
        if (adminStatus === 'rejected' || adminStatus === 'blocked') {
          return false
        }
        
        return (
          // Status conditions
          status === 'active' || 
          status === 'pending' ||
          status === 'in_progress' ||
          status === 'in-progress' ||
          status === 'ongoing' ||
          status === 'assigned' ||
          status === 'started' ||
          // Admin status conditions
          adminStatus === 'approved'
        )
      }).length || 0
      
      // Calculate completed campaigns
      const completedCampaigns = campaigns?.filter(campaign => {
        const status = campaign.status?.toLowerCase()
        const adminStatus = campaign.admin_status?.toLowerCase()
        
        return (
          status === 'completed' || 
          status === 'finished' ||
          status === 'done' ||
          status === 'delivered' ||
          status === 'submitted' ||
          status === 'closed' ||
          adminStatus === 'completed'
        )
      }).length || 0
      
      // Get unique brands
      const brandIds = campaigns
        ?.map(campaign => campaign.brand_id)
        .filter((id): id is string => !!id)
      
      const uniqueBrands = new Set(brandIds).size
      
      console.log("Calculated stats:", {
        totalCampaigns,
        ongoingCampaigns,
        completedCampaigns,
        uniqueBrands
      })
      
      // 4. Update state
      setStats({
        totalCampaigns,
        ongoingCampaigns,
        completedCampaigns,
        uniqueBrands
      })
      
    } catch (error) {
      console.error("Unexpected error:", error)
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStatClick = (title: string) => {
    console.log(`Clicked ${title}`)
    // You could implement navigation here
  }

  const getMonthlyChange = (title: string, currentValue: number) => {
    if (currentValue === 0) {
      switch (title) {
        case "Total Campaigns":
          return "Start your first campaign"
        case "Ongoing Campaigns":
          return "No active campaigns"
        case "Completed Campaigns":
          return "Complete a campaign to start"
        case "Brands Worked With":
          return "No brand partnerships yet"
        default:
          return "No data yet"
      }
    }
    
    switch (title) {
      case "Total Campaigns":
        return `${currentValue} total`
      case "Ongoing Campaigns":
        return currentValue > 0 ? `${currentValue} active` : "None active"
      case "Completed Campaigns":
        return `${currentValue} completed`
      case "Brands Worked With":
        return `${currentValue} brand${currentValue !== 1 ? 's' : ''}`
      default:
        return ""
    }
  }

  // Updated color scheme to use #87599a
  const statCards = [
    {
      title: "Total Campaigns",
      value: stats.totalCampaigns,
      change: getMonthlyChange("Total Campaigns", stats.totalCampaigns),
      icon: Briefcase,
      color: "text-[#87599a]", // Updated to #87599a
      iconBg: "bg-[#87599a]/10", // 10% opacity background
    },
    {
      title: "Ongoing Campaigns",
      value: stats.ongoingCampaigns,
      change: getMonthlyChange("Ongoing Campaigns", stats.ongoingCampaigns),
      icon: Clock,
      color: "text-[#87599a]", // Updated to #87599a
      iconBg: "bg-[#87599a]/10",
    },
    {
      title: "Completed Campaigns",
      value: stats.completedCampaigns,
      change: getMonthlyChange("Completed Campaigns", stats.completedCampaigns),
      icon: CheckCircle2,
      color: "text-[#87599a]", // Updated to #87599a
      iconBg: "bg-[#87599a]/10",
    },
    {
      title: "Brands Worked With",
      value: stats.uniqueBrands,
      change: getMonthlyChange("Brands Worked With", stats.uniqueBrands),
      icon: TrendingUp,
      color: "text-[#87599a]", // Updated to #87599a
      iconBg: "bg-[#87599a]/10",
    },
  ]

  return (
    <div className="space-y-4">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Error loading stats</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={fetchUserAndCampaigns}
              className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Stats cards with new color scheme */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
            iconBg={stat.iconBg}
            onClick={() => handleStatClick(stat.title)}
            loading={loading}
          />
        ))}
      </div>
    </div>
  )
}