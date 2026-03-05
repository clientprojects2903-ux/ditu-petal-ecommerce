"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { Campaign, CampaignFormData } from "./campaign-dashboard"

interface CampaignModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign | null
  onSubmit: (data: CampaignFormData) => void
}

const contentTypeOptions = [
  "Instagram",
  "Instagram Reels",
  "Instagram Stories",
  "TikTok",
  "YouTube",
  "YouTube Shorts",
  "Blog Posts",
  "Pinterest",
  "Twitter/X",
]

const nicheOptions = [
  "Fashion",
  "Technology",
  "Fitness",
  "Food & Beverage",
  "Beauty",
  "Travel",
  "Gaming",
  "Lifestyle",
  "Finance",
  "Health",
]

export function CampaignModal({ open, onOpenChange, campaign, onSubmit }: CampaignModalProps) {
  const [formData, setFormData] = useState<Partial<CampaignFormData>>({
    brand_id: "brand_001",
    status: "pending",
    admin_status: "pending",
    minimum_followers: 0,
    minimum_subscribers: 0,
    campaign_content_type: [],
  })

  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isAdminStatusOpen, setIsAdminStatusOpen] = useState(false)
  const [isNicheOpen, setIsNicheOpen] = useState(false)

  useEffect(() => {
    if (campaign) {
      setFormData({
        brand_id: campaign.brand_id,
        influencer_id: campaign.influencer_id,
        campaign_name: campaign.campaign_name,
        campaign_description: campaign.campaign_description,
        campaign_budget: campaign.campaign_budget,
        campaign_content_type: campaign.campaign_content_type,
        campaign_timeline_start: campaign.campaign_timeline_start,
        campaign_timeline_end: campaign.campaign_timeline_end,
        minimum_followers: campaign.minimum_followers,
        minimum_subscribers: campaign.minimum_subscribers,
        campaign_niche: campaign.campaign_niche,
        status: campaign.status,
        admin_status: campaign.admin_status,
      })
    } else {
      setFormData({
        brand_id: "brand_001",
        status: "pending",
        admin_status: "pending",
        minimum_followers: 0,
        minimum_subscribers: 0,
        campaign_content_type: [],
      })
    }
  }, [campaign, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData as CampaignFormData)
  }

  const toggleContentType = (type: string) => {
    const current = formData.campaign_content_type || []
    const updated = current.includes(type) ? current.filter((t) => t !== type) : [...current, type]
    setFormData({ ...formData, campaign_content_type: updated })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Modal Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {campaign ? "Edit Campaign" : "Create New Campaign"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campaign Name */}
          <div className="space-y-2">
            <label htmlFor="campaign_name" className="block text-sm font-medium text-gray-700">
              Campaign Name *
            </label>
            <input
              id="campaign_name"
              type="text"
              value={formData.campaign_name || ""}
              onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
              placeholder="Enter campaign name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="campaign_description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="campaign_description"
              value={formData.campaign_description || ""}
              onChange={(e) => setFormData({ ...formData, campaign_description: e.target.value })}
              placeholder="Describe your campaign..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Budget and Niche */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="campaign_budget" className="block text-sm font-medium text-gray-700">
                Budget ($)
              </label>
              <input
                id="campaign_budget"
                type="number"
                value={formData.campaign_budget || ""}
                onChange={(e) =>
                  setFormData({ ...formData, campaign_budget: Number.parseFloat(e.target.value) || null })
                }
                placeholder="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Niche</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNicheOpen(!isNicheOpen)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {formData.campaign_niche || "Select niche"}
                  <svg
                    className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${isNicheOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isNicheOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    {nicheOptions.map((niche) => (
                      <button
                        key={niche}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, campaign_niche: niche })
                          setIsNicheOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        {niche}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="campaign_timeline_start" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                id="campaign_timeline_start"
                type="date"
                value={formData.campaign_timeline_start || ""}
                onChange={(e) => setFormData({ ...formData, campaign_timeline_start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="campaign_timeline_end" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                id="campaign_timeline_end"
                type="date"
                value={formData.campaign_timeline_end || ""}
                onChange={(e) => setFormData({ ...formData, campaign_timeline_end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Minimum Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="minimum_followers" className="block text-sm font-medium text-gray-700">
                Minimum Followers
              </label>
              <input
                id="minimum_followers"
                type="number"
                value={formData.minimum_followers || ""}
                onChange={(e) => setFormData({ ...formData, minimum_followers: Number.parseInt(e.target.value) || 0 })}
                placeholder="50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="minimum_subscribers" className="block text-sm font-medium text-gray-700">
                Minimum Subscribers
              </label>
              <input
                id="minimum_subscribers"
                type="number"
                value={formData.minimum_subscribers || ""}
                onChange={(e) =>
                  setFormData({ ...formData, minimum_subscribers: Number.parseInt(e.target.value) || 0 })
                }
                placeholder="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Content Types */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Content Types</label>
            <div className="flex flex-wrap gap-2">
              {contentTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleContentType(type)}
                  className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                    formData.campaign_content_type?.includes(type)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Status (only for edit) */}
          {campaign && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {formData.status}
                    <svg
                      className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isStatusOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                      {["pending", "active", "completed", "cancelled"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, status: status as Campaign["status"] })
                            setIsStatusOpen(false)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors capitalize"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Admin Status</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAdminStatusOpen(!isAdminStatusOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {formData.admin_status}
                    <svg
                      className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${isAdminStatusOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isAdminStatusOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                      {["pending", "approved", "rejected"].map((adminStatus) => (
                        <button
                          key={adminStatus}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, admin_status: adminStatus as Campaign["admin_status"] })
                            setIsAdminStatusOpen(false)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors capitalize"
                        >
                          {adminStatus}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {campaign ? "Save Changes" : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}