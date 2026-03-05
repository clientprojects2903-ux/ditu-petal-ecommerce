'use client'

import { useState, useEffect } from "react"
import { ArrowUpRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Type definition matching your table schema
interface Campaign {
  campaign_id: number
  brand_id: string
  influencer_id: number | null
  campaign_name: string
  campaign_description: string | null
  campaign_budget: number | null
  campaign_content_type: any | null
  campaign_timeline_start: string | null
  campaign_timeline_end: string | null
  minimum_followers: number | null
  minimum_subscribers: number | null
  campaign_niche: string | null
  status: string | null
  created_at: string | null
  updated_at: string | null
  admin_status: string
}

// Type for the table data (mapped from database)
interface CampaignRow {
  id: number
  name: string
  status: string
  spend: string
  startDate: string
}

const statusStyles: Record<string, string> = {
  Live: "bg-[#f0e6f5] text-[#87599a] border-[#e0d0e8]",
  Scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  Completed: "bg-teal-100 text-teal-800 border-teal-200",
  Paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Draft: "bg-[#f0e6f5] text-[#a58bb3] border-[#e0d0e8]",
  pending: "bg-[#f0e6f5] text-[#a58bb3] border-[#e0d0e8]",
  active: "bg-[#f0e6f5] text-[#87599a] border-[#e0d0e8]",
  completed: "bg-teal-100 text-teal-800 border-teal-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

export function RecentCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)

      // Create Supabase client
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw userError
      }

      if (!user) {
        setError("No user logged in")
        setLoading(false)
        return
      }

      console.log("Fetching campaigns for user:", user.id)

      // Fetch campaigns where brand_id matches current user's ID
      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5) // Get only recent campaigns

      if (fetchError) {
        throw fetchError
      }

      console.log("Fetched campaigns data:", data)

      // Transform the data to match your component's format
      const transformedData: CampaignRow[] = (data || []).map((campaign: Campaign) => ({
        id: campaign.campaign_id,
        name: campaign.campaign_name,
        status: getStatusDisplay(campaign.status || campaign.admin_status),
        spend: campaign.campaign_budget 
          ? formatCurrency(campaign.campaign_budget)
          : '₹0',
        startDate: campaign.campaign_timeline_start 
          ? formatDate(campaign.campaign_timeline_start) 
          : 'Not set',
      }))

      setCampaigns(transformedData)
    } catch (err: any) {
      console.error('Error fetching campaigns:', err)
      setError(err.message || 'Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format currency in INR
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'standard'
    }).format(amount)
  }

  // Helper function to format status for display
  const getStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Draft',
      'active': 'Live',
      'scheduled': 'Scheduled',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'draft': 'Draft',
      'paused': 'Paused'
    }
    
    const normalizedStatus = status.toLowerCase()
    return statusMap[normalizedStatus] || 
           status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return 'Invalid date'
    }
  }

  // Get status class based on status text
  const getStatusClass = (status: string): string => {
    const normalizedStatus = status.toLowerCase()
    
    // Check if exact status exists
    if (statusStyles[normalizedStatus]) {
      return statusStyles[normalizedStatus]
    }
    
    // Check if display status exists
    if (statusStyles[status]) {
      return statusStyles[status]
    }
    
    // Default to light purple for unknown statuses
    return "bg-[#f0e6f5] text-[#6b4f73] border-[#e0d0e8]"
  }

  if (loading) {
    return (
      <div className="border border-[#e0d0e8] rounded-lg bg-white shadow-sm p-6">
        <div className="mb-6">
          <div className="h-6 bg-[#f0e6f5] rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-[#f0e6f5] rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-[#f0e6f5] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-[#e0d0e8] rounded-lg bg-white shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#4a2c4d]">Recent Campaigns</h3>
          <p className="text-sm text-[#6b4f73]">Your latest campaign activity</p>
        </div>
        <div className="text-center py-8 border border-red-200 rounded-md bg-red-50">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchCampaigns}
            className="px-4 py-2 bg-[#87599a] text-white rounded-md hover:bg-[#764887] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-[#e0d0e8] rounded-lg bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#4a2c4d]">Recent Campaigns</h3>
              <p className="text-sm text-[#6b4f73]">Your latest campaign activity</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchCampaigns}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium border border-[#e0d0e8] rounded-md text-[#6b4f73] hover:bg-[#f8f5fa] hover:text-[#87599a] transition-colors"
              >
                Refresh
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {campaigns.length === 0 ? (
          <div className="text-center py-8 border border-[#e0d0e8] rounded-md bg-[#f8f5fa]">
            <p className="text-[#6b4f73] mb-4">No campaigns found.</p>
            <p className="text-sm text-[#a58bb3]">Create your first campaign to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e0d0e8]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6b4f73]">Campaign</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6b4f73]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6b4f73]">Budget</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6b4f73]">Start Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6b4f73]">Campaign ID</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-[#e0d0e8] last:border-0 hover:bg-[#f8f5fa] transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-medium text-[#4a2c4d]">{campaign.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClass(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-[#4a2c4d]">{campaign.spend}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[#6b4f73]">{campaign.startDate}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs text-[#a58bb3] font-mono">#{campaign.id}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
  {campaigns.length > 0 && (
  <div className="mt-4 text-center">
    <a
      href="/dashboard/brand/campaign/view"
      className="text-sm text-[#87599a] hover:text-[#764887] font-medium transition-colors"
    >
      View All Campaigns →
    </a>
  </div>
)}
      </div>
    </div>
  )
}