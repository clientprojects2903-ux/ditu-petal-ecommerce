"use client"

import { CheckCircle, XCircle, Calendar, DollarSign, User, Tag } from "lucide-react"
import type { Campaign, CampaignStatus } from "./campaigns-table"

interface CampaignDetailDialogProps {
  campaign: Campaign | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (id: number) => void  // Changed to number
  onReject: (id: number) => void   // Changed to number
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  }

  const labels = {
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
  }

  const dotColors = {
    pending: "bg-yellow-500",
    approved: "bg-green-500",
    rejected: "bg-red-500",
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${styles[status]}`}>
      <span className={`h-2 w-2 rounded-full ${dotColors[status]}`} />
      {labels[status]}
    </span>
  )
}

export function CampaignDetailDialog({ campaign, open, onOpenChange, onApprove, onReject }: CampaignDetailDialogProps) {
  if (!campaign || !open) return null

  const handleApprove = () => {
    onApprove(campaign.campaign_id)  // Use campaign_id instead of id
    onOpenChange(false)
  }

  const handleReject = () => {
    onReject(campaign.campaign_id)   // Use campaign_id instead of id
    onOpenChange(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  // Helper functions
  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // If you need to get brand info, you might need to fetch it separately
  // For now, using brand_id directly
  const brandName = campaign.brand_id || 'Unknown Brand'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-[500px] w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Dialog Header */}
        <div className="p-6 border-b border-gray-300">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900">{campaign.campaign_name}</h2>
            <StatusBadge status={campaign.admin_status} />
          </div>
          <p className="text-gray-500 text-sm">Campaign ID: CAM-{campaign.campaign_id.toString().padStart(3, '0')}</p>
        </div>

        {/* Dialog Content */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{campaign.campaign_description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Budget</p>
                <p className="text-sm font-medium text-gray-900">{formatBudget(campaign.campaign_budget || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {campaign.campaign_timeline_start ? formatDate(campaign.campaign_timeline_start) : 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Tag className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm font-medium text-gray-900">{campaign.campaign_niche || 'Uncategorized'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Brand</p>
                <p className="text-sm font-medium text-gray-900">{brandName}</p>
              </div>
            </div>
          </div>

          {/* Additional info based on your Campaign type */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Campaign Timeline</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {campaign.campaign_timeline_start ? formatDate(campaign.campaign_timeline_start) : 'Not set'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {campaign.campaign_timeline_end ? formatDate(campaign.campaign_timeline_end) : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Min Followers</p>
                  <p className="text-sm font-medium text-gray-900">
                    {campaign.minimum_followers?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Min Subscribers</p>
                  <p className="text-sm font-medium text-gray-900">
                    {campaign.minimum_subscribers?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* If you have submittedBy info, you can fetch it separately */}
          {campaign.submittedBy && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Submitted By</h4>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                  {getInitials(campaign.submittedBy.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{campaign.submittedBy.name}</p>
                  <p className="text-xs text-gray-500">{campaign.submittedBy.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="p-6 border-t border-gray-300 flex justify-end gap-2">
          {campaign.admin_status === "pending" ? (
            <>
              <button
                onClick={handleReject}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>
            </>
          ) : (
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}