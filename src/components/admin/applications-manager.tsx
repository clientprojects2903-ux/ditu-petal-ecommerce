"use client"

import { useState, useEffect } from "react"
import { ApplicationCard } from "./application-card"


import { createClient } from "@/lib/supabase/client"



// Types
interface Influencer {
  id: string
  name: string
  avatar: string
  handle: string
  followers: number
  engagementRate: number
  niche: string
}

interface Application {
  id: string
  influencer: Influencer
  campaignId: string
  bidAmount: number
  proposedDeliverables: string
  estimatedReach: number
  appliedAt: string
  status: "pending" | "approved" | "rejected"
  message: string
}

interface ApplicationsManagerProps {
  applications?: Application[] // Optional: pre-loaded applications
  campaignId?: string // Required if applications not provided
  campaignBudget: number
  onApplicationUpdate?: () => void // Callback when application status changes
}

type SortOption = "bid-asc" | "bid-desc" | "engagement" | "followers" | "date"
type FilterOption = "all" | "pending" | "approved" | "rejected"

// Icon components
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const SlidersHorizontalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" x2="14" y1="4" y2="4" />
    <line x1="10" x2="3" y1="4" y2="4" />
    <line x1="21" x2="12" y1="12" y2="12" />
    <line x1="8" x2="3" y1="12" y2="12" />
    <line x1="21" x2="16" y1="20" y2="20" />
    <line x1="12" x2="3" y1="20" y2="20" />
    <line x1="14" x2="14" y1="2" y2="6" />
    <line x1="8" x2="8" y1="10" y2="14" />
    <line x1="16" x2="16" y1="18" y2="22" />
  </svg>
)

const ArrowUpDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 16-4 4-4-4" />
    <path d="M17 20V4" />
    <path d="m3 8 4-4 4 4" />
    <path d="M7 4v16" />
  </svg>
)

const GitCompareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
    <path d="M11 18H8a2 2 0 0 1-2-2V9" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export function ApplicationsManager({ 
  applications: initialApplications, 
  campaignId,
  campaignBudget,
  onApplicationUpdate 
}: ApplicationsManagerProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications || [])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("bid-asc")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])
  const [showComparePanel, setShowComparePanel] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [loading, setLoading] = useState(!initialApplications && campaignId ? true : false)
  const [error, setError] = useState<string | null>(null)

  // Fetch applications from database if campaignId is provided
  useEffect(() => {
    const fetchApplications = async () => {
      if (!campaignId || initialApplications) return
      
      try {
        setLoading(true)
        setError(null)
        const supabase = createClient()
        
        // Fetch applications for this campaign
        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select(`
            application_id,
            influencer_id,
            campaign_id,
            bid_amount,
            expected_completion_date,
            status,
            created_at,
            updated_at,
            pitch,
            profiles!inner (
              id,
              full_name,
              avatar_url,
              username,
              followers_count,
              engagement_rate,
              niche
            )
          `)
          .eq('campaign_id', parseInt(campaignId))
          .order('created_at', { ascending: false })
        
        if (appsError) {
          throw appsError
        }
        
        if (!appsData || appsData.length === 0) {
          setApplications([])
          setLoading(false)
          return
        }
        
        // Transform data to match Application interface
        const transformedApplications: Application[] = appsData.map((app: any) => ({
          id: app.application_id,
          influencer: {
            id: app.profiles.id,
            name: app.profiles.full_name || app.profiles.username || 'Unknown Influencer',
            avatar: app.profiles.avatar_url || '/placeholder.svg',
            handle: `@${app.profiles.username || 'unknown'}`,
            followers: app.profiles.followers_count || 0,
            engagementRate: app.profiles.engagement_rate || 0,
            niche: app.profiles.niche || 'General'
          },
          campaignId: app.campaign_id.toString(),
          bidAmount: app.bid_amount || 0,
          proposedDeliverables: app.pitch || '',
          estimatedReach: app.profiles.followers_count || 0,
          appliedAt: app.created_at,
          status: (app.status as "pending" | "approved" | "rejected") || 'pending',
          message: app.pitch || ''
        }))
        
        setApplications(transformedApplications)
        
      } catch (error) {
        console.error('Error fetching applications:', error)
        setError(error instanceof Error ? error.message : 'Failed to load applications')
  
      } finally {
        setLoading(false)
      }
    }
    
    fetchApplications()
  }, [campaignId, initialApplications])

  // Set up real-time subscription for application updates
  useEffect(() => {
    if (!campaignId) return
    
    const supabase = createClient()
    
    const channel = supabase
      .channel('applications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `campaign_id=eq.${parseInt(campaignId)}`
        },
        (payload) => {
          console.log('Real-time update received:', payload)
          
          // Refresh applications when changes occur
          if (!initialApplications) {
            // Refetch applications from database
            const refreshApplications = async () => {
              const supabase = createClient()
              const { data: appsData } = await supabase
                .from('applications')
                .select(`
                  application_id,
                  influencer_id,
                  campaign_id,
                  bid_amount,
                  status,
                  created_at,
                  pitch,
                  profiles!inner (*)
                `)
                .eq('campaign_id', parseInt(campaignId))
                .order('created_at', { ascending: false })
              
              if (appsData) {
                const transformed = appsData.map((app: any) => ({
                  id: app.application_id,
                  influencer: {
                    id: app.profiles.id,
                    name: app.profiles.full_name || app.profiles.username || 'Unknown',
                    avatar: app.profiles.avatar_url || '/placeholder.svg',
                    handle: `@${app.profiles.username || 'unknown'}`,
                    followers: app.profiles.followers_count || 0,
                    engagementRate: app.profiles.engagement_rate || 0,
                    niche: app.profiles.niche || 'General'
                  },
                  campaignId: app.campaign_id.toString(),
                  bidAmount: app.bid_amount || 0,
                  proposedDeliverables: app.pitch || '',
                  estimatedReach: app.profiles.followers_count || 0,
                  appliedAt: app.created_at,
                  status: (app.status as "pending" | "approved" | "rejected") || 'pending',
                  message: app.pitch || ''
                }))
                setApplications(transformed)
              }
            }
            refreshApplications()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaignId, initialApplications])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleApprove = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve application')
      }
      
      // Update local state immediately for better UX
      setApplications((prev) =>
        prev.map((app) => 
          app.id === applicationId 
            ? { ...app, status: "approved" as const } 
            : app.status === "pending" && app.campaignId === applications.find(a => a.id === applicationId)?.campaignId
            ? { ...app, status: "rejected" as const }
            : app
        ),
      )
      
     
      
      // Notify parent component of update
      if (onApplicationUpdate) {
        onApplicationUpdate()
      }
      
    } catch (error) {
      console.error('Error approving application:', error)

    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject application')
      }
      
      // Update local state
      setApplications((prev) =>
        prev.map((app) => 
          app.id === applicationId 
            ? { ...app, status: "rejected" as const } 
            : app
        ),
      )
      
      
      
      // Notify parent component of update
      if (onApplicationUpdate) {
        onApplicationUpdate()
      }
      
    } catch (error) {
      console.error('Error rejecting application:', error)

    }
  }

  const toggleCompare = (applicationId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(applicationId)) {
        return prev.filter((id) => id !== applicationId)
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), applicationId]
      }
      return [...prev, applicationId]
    })
  }

  const filteredApplications = applications
    .filter((app) => {
      if (filterBy !== "all" && app.status !== filterBy) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          app.influencer.name.toLowerCase().includes(query) ||
          app.influencer.handle.toLowerCase().includes(query) ||
          app.influencer.niche.toLowerCase().includes(query)
        )
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "bid-asc":
          return a.bidAmount - b.bidAmount
        case "bid-desc":
          return b.bidAmount - a.bidAmount
        case "engagement":
          return b.influencer.engagementRate - a.influencer.engagementRate
        case "followers":
          return b.influencer.followers - a.influencer.followers
        case "date":
          return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        default:
          return 0
      }
    })

  const pendingCount = applications.filter((a) => a.status === "pending").length
  const approvedCount = applications.filter((a) => a.status === "approved").length
  const rejectedCount = applications.filter((a) => a.status === "rejected").length
  const lowestBid = applications.length > 0 ? Math.min(...applications.map((a) => a.bidAmount)) : 0
  const highestEngagement = applications.length > 0 ? Math.max(...applications.map((a) => a.influencer.engagementRate)) : 0

  const compareApplications = applications.filter((app) => selectedForCompare.includes(app.id))

  const sortLabels: Record<SortOption, string> = {
    "bid-asc": "Lowest Bid First",
    "bid-desc": "Highest Bid First",
    engagement: "Best Engagement",
    followers: "Most Followers",
    date: "Most Recent",
  }

  const filterLabels: Record<FilterOption, string> = {
    all: "All",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span className="font-medium">Error loading applications</span>
        </div>
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats and Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Applications Received</h2>
          <p className="text-sm text-gray-500 mt-1">
            {applications.length} total · {pendingCount} pending · {approvedCount} approved · {rejectedCount} rejected
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {applications.length > 0 && (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-sm">
                <span className="text-gray-600">Best Bid:</span>
                <span className="font-semibold text-green-700">{formatCurrency(lowestBid)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm">
                <span className="text-gray-600">Top Engagement:</span>
                <span className="font-semibold text-blue-700">{highestEngagement}%</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search influencers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 pl-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-300 p-1">
            {(["all", "pending", "approved", "rejected"] as const).map((filter) => {
              const count = applications.filter((a) => a.status === filter).length
              return (
                <button
                  key={filter}
                  onClick={() => setFilterBy(filter)}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    filterBy === filter 
                      ? "bg-gray-100 text-gray-900" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {filterLabels[filter]}
                  {filter !== "all" && (
                    <span className={`ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-medium ${
                      filterBy === filter
                        ? "bg-gray-300 text-gray-800"
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowUpDownIcon />
              {sortLabels[sortBy]}
              <ChevronDownIcon />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 z-10 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                {Object.entries(sortLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSortBy(key as SortOption)
                      setShowSortMenu(false)
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                      sortBy === key ? "bg-blue-50 text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Compare Button */}
          {selectedForCompare.length >= 2 && (
            <button
              onClick={() => setShowComparePanel(true)}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <GitCompareIcon />
              Compare ({selectedForCompare.length})
            </button>
          )}
        </div>
      </div>

      {/* Applications Grid */}
      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16">
          <div className="text-gray-400 mb-3">
            <SlidersHorizontalIcon />
          </div>
          <p className="text-gray-500 mb-2">
            {campaignId ? 'No applications received yet' : 'No applications to display'}
          </p>
          <p className="text-sm text-gray-400 text-center max-w-md mb-4">
            Applications will appear here when influencers apply to your campaign.
            Share your campaign link to attract more applications.
          </p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16">
          <div className="text-gray-400 mb-3">
            <SlidersHorizontalIcon />
          </div>
          <p className="text-gray-500 mb-2">No applications match your filters</p>
          <button
            onClick={() => {
              setSearchQuery("")
              setFilterBy("all")
            }}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              campaignBudget={campaignBudget}
              isLowestBid={application.bidAmount === lowestBid}
              isHighestEngagement={application.influencer.engagementRate === highestEngagement}
              isSelectedForCompare={selectedForCompare.includes(application.id)}
              onApprove={() => handleApprove(application.id)}
              onReject={() => handleReject(application.id)}
              onToggleCompare={() => toggleCompare(application.id)}
            />
          ))}
        </div>
      )}

      {/* Compare Panel Modal */}
      {showComparePanel && compareApplications.length >= 2 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Compare Applications ({compareApplications.length})</h3>
                <button
                  onClick={() => setShowComparePanel(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {compareApplications.map((app) => (
                  <div key={app.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full border-2 border-gray-200 overflow-hidden">
                        <img
                          src={app.influencer.avatar || "/placeholder.svg"}
                          alt={app.influencer.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{app.influencer.name}</h4>
                        <p className="text-sm text-gray-500">{app.influencer.handle}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Bid Amount:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(app.bidAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Followers:</span>
                        <span className="font-medium text-gray-900">
                          {app.influencer.followers >= 1000000
                            ? (app.influencer.followers / 1000000).toFixed(1) + "M"
                            : app.influencer.followers >= 1000
                            ? (app.influencer.followers / 1000).toFixed(0) + "K"
                            : app.influencer.followers.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Engagement Rate:</span>
                        <span className="font-medium text-gray-900">{app.influencer.engagementRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Niche:</span>
                        <span className="font-medium text-gray-900 capitalize">{app.influencer.niche}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`font-medium ${
                          app.status === 'approved' ? 'text-green-600' :
                          app.status === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                      {app.status === "pending" && (
                        <button
                          onClick={() => {
                            handleApprove(app.id)
                            setShowComparePanel(false)
                          }}
                          className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                        >
                          Approve This Application
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowComparePanel(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowComparePanel(false)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Done Comparing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}