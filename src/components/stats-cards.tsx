"use client"

import { useState, useEffect } from "react"
import { Megaphone, PlayCircle, CheckCircle2, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"


interface StatsData {
  title: string
  value: string | number
  change: string
  trend: "up" | "down"
  icon: React.ComponentType<{ className?: string }>
  description: string
}

interface Campaign {
  status: string
  campaign_budget: number | null
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Use your centralized client
  const supabase = createClient()

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        setUserId(user?.id || null)
      } catch (err) {
        console.error("Error fetching user:", err)
      }
    }
    
    getUser()
  }, [supabase.auth])

  // Fetch campaign statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return

      setLoading(true)
      
      try {
        // Fetch all campaigns for this user's brand
        const { data: campaigns, error } = await supabase
          .from("campaigns")
          .select("*")
          .eq("brand_id", userId)

        if (error) throw error

        // Calculate statistics
        const totalCampaigns = campaigns?.length || 0
        
        const liveCampaigns = campaigns?.filter(campaign => 
          campaign.status === "active"
        ).length || 0
        
        const closedCampaigns = campaigns?.filter(campaign => 
          ["completed", "cancelled"].includes(campaign.status)
        ).length || 0
        
        const totalSpend = campaigns?.reduce((sum: number, campaign: Campaign) => 
          sum + (campaign.campaign_budget || 0), 0
        ) || 0

        // Helper function to format currency in INR without rounding
        const formatCurrency = (amount: number) => {
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            notation: 'standard'
          }).format(amount)
        }

        // For demo - you can implement real change calculations
        // This would typically compare with data from a previous period
        const getChange = (current: number, title: string) => {
          // These are placeholder calculations
          // In a real app, you'd fetch historical data
          switch(title) {
            case "Total Campaigns":
              return current > 0 ? "+12%" : "0%"
            case "Live Campaigns":
              return current > 0 ? "+8%" : "0%"
            case "Closed Campaigns":
              return current > 0 ? "+15%" : "0%"
            case "Total Spend":
              return totalSpend > 0 ? "+5%" : "0%"
            default:
              return "+0%"
          }
        }

        const getTrend = (change: string) => {
          return change.startsWith('+') ? "up" : "down"
        }

        // Set stats data
        const statsData: StatsData[] = [
          {
            title: "Total Campaigns",
            value: totalCampaigns,
            change: getChange(totalCampaigns, "Total Campaigns"),
            trend: getTrend(getChange(totalCampaigns, "Total Campaigns")),
            icon: Megaphone,
            description: "All campaigns created",
          },
          {
            title: "Live Campaigns",
            value: liveCampaigns,
            change: getChange(liveCampaigns, "Live Campaigns"),
            trend: getTrend(getChange(liveCampaigns, "Live Campaigns")),
            icon: PlayCircle,
            description: "Currently active",
          },
          {
            title: "Closed Campaigns",
            value: closedCampaigns,
            change: getChange(closedCampaigns, "Closed Campaigns"),
            trend: getTrend(getChange(closedCampaigns, "Closed Campaigns")),
            icon: CheckCircle2,
            description: "Completed or cancelled",
          },
          {
            title: "Total Spend",
            value: formatCurrency(totalSpend),
            change: getChange(totalSpend, "Total Spend"),
            trend: getTrend(getChange(totalSpend, "Total Spend")),
            icon: DollarSign,
            description: "All time budget",
          },
        ]

        setStats(statsData)
      } catch (err) {
        console.error("Error fetching campaign stats:", err)
        // Fallback to default stats
        setStats(getDefaultStats())
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId, supabase])

  // Default stats for loading/error state
  const getDefaultStats = (): StatsData[] => [
    {
      title: "Total Campaigns",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Megaphone,
      description: "All campaigns created",
    },
    {
      title: "Live Campaigns",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: PlayCircle,
      description: "Currently active",
    },
    {
      title: "Closed Campaigns",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: CheckCircle2,
      description: "Completed or cancelled",
    },
    {
      title: "Total Spend",
      value: "₹0",
      change: "+0%",
      trend: "up",
      icon: DollarSign,
      description: "All time budget",
    },
  ]

  // Display loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#4a2c4d]">Campaign Overview</h1>
            <p className="text-[#6b4f73] text-sm mt-1">Track your brand campaign performance</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6b4f73]">
            <span>Last 30 days</span>
            <div className="w-2 h-2 rounded-full bg-[#87599a] animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="border border-[#e0d0e8] rounded-lg bg-white animate-pulse">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-[#f0e6f5]">
                    <div className="h-5 w-5" />
                  </div>
                  <div className="h-4 w-12 bg-[#f0e6f5] rounded" />
                </div>
                <div className="mt-4">
                  <div className="h-8 w-16 bg-[#f0e6f5] rounded" />
                  <div className="h-4 w-24 bg-[#f0e6f5] rounded mt-2" />
                </div>
                <div className="h-3 w-32 bg-[#f0e6f5] rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#4a2c4d]">Campaign Overview</h1>
          <p className="text-[#6b4f73] text-sm mt-1">Track your brand campaign performance</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6b4f73]">
          <span>Last 30 days</span>
          <div className="w-2 h-2 rounded-full bg-[#87599a] animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="border border-[#e0d0e8] rounded-lg bg-white hover:shadow-md transition-shadow hover:border-[#87599a]">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-[#f0e6f5]">
                  <stat.icon className="h-5 w-5 text-[#87599a]" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-[#4a2c4d]">{stat.value}</p>
                <p className="text-sm text-[#6b4f73] mt-1">{stat.title}</p>
              </div>
              <p className="text-xs text-[#a58bb3] mt-2">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}