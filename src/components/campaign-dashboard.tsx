"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import Link from "next/link"

import { CampaignFilters } from "@/components/campaign-filters"
import { CampaignModal } from "@/components/campaign-modal"
import { CampaignTable } from "@/components/campaign-table"

// Types based on your Supabase database schema
export interface Campaign {
  campaign_id: number
  brand_id: string
  influencer_id: number | null
  campaign_name: string
  campaign_description: string | null
  campaign_budget: number | null
  campaign_content_type: string[] | null
  campaign_timeline_start: string | null
  campaign_timeline_end: string | null
  minimum_followers: number
  minimum_subscribers: number
  campaign_niche: string | null
  status: "pending" | "active" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  admin_status: "pending" | "approved" | "rejected"
}

export type CampaignFormData = Omit<Campaign, "campaign_id" | "created_at" | "updated_at">

export function CampaignDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Create Supabase client using SSR package
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          throw userError
        }
        
        setUserId(user?.id || null)
      } catch (err) {
        console.error("Error fetching user:", err)
        setError("Failed to load user data")
      }
    }
    
    getUser()
  }, [supabase.auth])

  // Fetch campaigns based on user's brand_id
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!userId) return

      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("brand_id", userId)
          .order("created_at", { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setCampaigns(data as Campaign[])
      } catch (err) {
        console.error("Error fetching campaigns:", err)
        setError("Failed to load campaigns. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [userId, supabase])

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesAdminStatus = adminStatusFilter === "all" || campaign.admin_status === adminStatusFilter
    const matchesSearch =
      campaign.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (campaign.campaign_niche && campaign.campaign_niche.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesStatus && matchesAdminStatus && matchesSearch
  })

  const handleCreateCampaign = async (data: CampaignFormData) => {
    if (!userId) {
      setError("User not authenticated")
      return
    }

    try {
      const { data: newCampaign, error } = await supabase
        .from("campaigns")
        .insert([{
          ...data,
          brand_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) throw error

      setCampaigns([newCampaign as Campaign, ...campaigns])
      setIsModalOpen(false)
    } catch (err) {
      console.error("Error creating campaign:", err)
      setError("Failed to create campaign")
    }
  }

  const handleEditCampaign = async (data: CampaignFormData) => {
    if (!editingCampaign) return

    try {
      const { data: updatedCampaign, error } = await supabase
        .from("campaigns")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("campaign_id", editingCampaign.campaign_id)
        .select()
        .single()

      if (error) throw error

      const updatedCampaigns = campaigns.map((c) =>
        c.campaign_id === editingCampaign.campaign_id ? (updatedCampaign as Campaign) : c
      )
      setCampaigns(updatedCampaigns)
      setEditingCampaign(null)
      setIsModalOpen(false)
    } catch (err) {
      console.error("Error updating campaign:", err)
      setError("Failed to update campaign")
    }
  }

  const handleDeleteCampaign = async (campaignId: number) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("campaign_id", campaignId)

      if (error) throw error

      setCampaigns(campaigns.filter((c) => c.campaign_id !== campaignId))
    } catch (err) {
      console.error("Error deleting campaign:", err)
      setError("Failed to delete campaign")
    }
  }

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingCampaign(null)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#87599a]"></div>
            <p className="text-[#6b4f73]">Loading campaigns...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-[#87599a] text-white rounded-md hover:bg-[#764887] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#4a2c4d]">Campaigns</h1>
            <p className="text-[#6b4f73] mt-1">Manage and track all your influencer marketing campaigns</p>
          </div>
          <Link
            href="/dashboard/brand/campaign/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#87599a] text-white font-medium rounded-md hover:bg-[#764887] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </Link>
        </div>

        <CampaignFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          adminStatusFilter={adminStatusFilter}
          setAdminStatusFilter={setAdminStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#e0d0e8] rounded-lg bg-[#f8f5fa]">
            <p className="text-[#6b4f73] mb-2">No campaigns found.</p>
            <p className="text-sm text-[#a58bb3]">Create your first campaign to get started!</p>
            {campaigns.length === 0 && (
              <Link
                href="/dashboard/brand/campaign/create"
                className="inline-flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-[#87599a] text-white font-medium rounded-md hover:bg-[#764887] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Campaign
              </Link>
            )}
          </div>
        ) : (
          <>
            <CampaignTable 
              campaigns={filteredCampaigns} 
              onEdit={openEditModal} 
              onDelete={handleDeleteCampaign} 
            />
            {filteredCampaigns.length < campaigns.length && (
              <p className="text-sm text-[#a58bb3] text-center">
                Showing {filteredCampaigns.length} of {campaigns.length} campaigns
              </p>
            )}
          </>
        )}

        <CampaignModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          campaign={editingCampaign}
          onSubmit={editingCampaign ? handleEditCampaign : handleCreateCampaign}
        />
      </div>
    </div>
  )
}