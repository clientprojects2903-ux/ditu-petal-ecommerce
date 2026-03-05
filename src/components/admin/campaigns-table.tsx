"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, CheckCircle, XCircle, Eye, GitBranch } from "lucide-react"
import { supabase } from "@/lib/supabase"

export type CampaignStatus = "pending" | "approved" | "rejected"
export type AdminStatus = "pending" | "approved" | "rejected"

export interface Campaign {
  id: number
  campaign_id: number
  campaign_name: string
  campaign_description: string
  campaign_budget: number
  campaign_niche: string
  status: CampaignStatus
  admin_status: AdminStatus
  brand_id: string
  influencer_id: number | null
  campaign_content_type: any
  campaign_timeline_start: string
  campaign_timeline_end: string
  minimum_followers: number
  minimum_subscribers: number
  created_at: string
  updated_at: string
  submittedBy?: {
    name: string
    email: string
    avatar?: string
  }
  submittedAt?: string
  startDate?: string
  description?: string
}

function StatusBadge({ status }: { status: CampaignStatus | AdminStatus }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  }

  const labels = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  }

  const dotColors = {
    pending: "bg-yellow-500",
    approved: "bg-green-500",
    rejected: "bg-red-500",
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[status]}`} />
      {labels[status]}
    </span>
  )
}

export function CampaignsTable() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  // Fetch campaigns from Supabase
  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setCampaigns(data || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (campaignId: number) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          admin_status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('campaign_id', campaignId)

      if (error) throw error
      
      // Update local state
      setCampaigns(campaigns.map((c) => 
        c.campaign_id === campaignId 
          ? { ...c, admin_status: 'approved' as AdminStatus } 
          : c
      ))
      setDropdownOpen(null)
    } catch (error) {
      console.error('Error approving campaign:', error)
    }
  }

  const handleReject = async (campaignId: number) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          admin_status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('campaign_id', campaignId)

      if (error) throw error
      
      // Update local state
      setCampaigns(campaigns.map((c) => 
        c.campaign_id === campaignId 
          ? { ...c, admin_status: 'rejected' as AdminStatus } 
          : c
      ))
      setDropdownOpen(null)
    } catch (error) {
      console.error('Error rejecting campaign:', error)
    }
  }

  const openDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setDialogOpen(true)
    setDropdownOpen(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  // Format budget as Indian Rupees
  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <>
      <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-300">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Campaign</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 hidden md:table-cell">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 hidden lg:table-cell">Brand ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 hidden sm:table-cell">Budget</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 hidden lg:table-cell">Created</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.campaign_id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{campaign.campaign_name}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          CAM-{campaign.campaign_id.toString().padStart(3, '0')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={campaign.admin_status} />
                  </td>
                  <td className="py-4 px-4 text-gray-600 hidden md:table-cell">
                    {campaign.campaign_niche || 'Uncategorized'}
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                        {campaign.brand_id.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-600 truncate max-w-[120px]">
                        {campaign.brand_id}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 hidden sm:table-cell">
                    {formatBudget(campaign.campaign_budget || 0)}
                  </td>
                  <td className="py-4 px-4 text-gray-600 hidden lg:table-cell">
                    {timeAgo(campaign.created_at)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {campaign.admin_status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(campaign.campaign_id)}
                            className="h-8 w-8 rounded-md hover:bg-green-50 flex items-center justify-center transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleReject(campaign.campaign_id)}
                            className="h-8 w-8 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </button>
                        </>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === campaign.campaign_id.toString() ? null : campaign.campaign_id.toString())}
                          className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors"
                          title="More options"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-600" />
                        </button>
                        
                        {dropdownOpen === campaign.campaign_id.toString() && (
                          <div className="absolute z-10 right-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
                            <button
                              onClick={() => openDetail(campaign)}
                              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </button>
                            <hr className="border-gray-200" />
                            <button
                              onClick={() => handleApprove(campaign.campaign_id)}
                              disabled={campaign.admin_status === "approved"}
                              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(campaign.campaign_id)}
                              disabled={campaign.admin_status === "rejected"}
                              className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Campaign Details Dialog */}
      {dialogOpen && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedCampaign.campaign_name}</h2>
                  <p className="text-sm text-gray-500">CAM-{selectedCampaign.campaign_id.toString().padStart(3, '0')}</p>
                </div>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <StatusBadge status={selectedCampaign.admin_status} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Brand ID</h3>
                  <p className="text-gray-900">{selectedCampaign.brand_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Budget</h3>
                  <p className="text-gray-900">{formatBudget(selectedCampaign.campaign_budget || 0)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                  <p className="text-gray-900">{selectedCampaign.campaign_niche || 'Uncategorized'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                  <p className="text-gray-900">
                    {selectedCampaign.campaign_timeline_start 
                      ? formatDate(selectedCampaign.campaign_timeline_start) 
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
                  <p className="text-gray-900">
                    {selectedCampaign.campaign_timeline_end 
                      ? formatDate(selectedCampaign.campaign_timeline_end) 
                      : 'Not set'}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-900 whitespace-pre-line">
                  {selectedCampaign.campaign_description || 'No description provided.'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Min Followers</h3>
                  <p className="text-gray-900">
                    {selectedCampaign.minimum_followers?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Min Subscribers</h3>
                  <p className="text-gray-900">
                    {selectedCampaign.minimum_subscribers?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                  <p className="text-gray-900">{formatDate(selectedCampaign.created_at)}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                {selectedCampaign.admin_status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedCampaign.campaign_id)
                        setDialogOpen(false)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve Campaign
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedCampaign.campaign_id)
                        setDialogOpen(false)
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject Campaign
                    </button>
                  </>
                )}
                <button
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}