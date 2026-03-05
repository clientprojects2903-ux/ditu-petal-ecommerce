"use client"

import { useState, useEffect } from "react"
import { CampaignCard, type Campaign } from "./campaign-card"
import { Search, SlidersHorizontal } from "lucide-react"
import { supabase } from "@/lib/supabase"

// Define types for our data
type User = {
  id: string
  full_name: string | null
  profile_image_url: string | null
  email: string
  role: string
}

type CampaignData = {
  campaign_id: number
  brand_id: string
  influencer_id: string | null
  campaign_name: string
  campaign_description: string | null
  campaign_budget: number | null
  campaign_content_type: any
  campaign_timeline_start: string | null
  campaign_timeline_end: string | null
  minimum_followers: number | null
  minimum_subscribers: number | null
  campaign_niche: string | null
  status: string | null
  created_at: string | null
  updated_at: string | null
  admin_status: string
  selection_type: 'application_select' | 'self_select' | 'managed' // Add selection_type
  brand?: User | null
}

// Helper functions that need to be declared BEFORE they're used
const getPlatformFromContentType = (contentType: any): string => {
  if (!contentType) return "Multiple"
  
  try {
    if (Array.isArray(contentType)) {
      const contentTypes = contentType.map((item: any) => 
        typeof item === 'string' ? item.toLowerCase() : String(item).toLowerCase()
      )
      
      if (contentTypes.some((item: string) => item.includes('instagram'))) return "Instagram"
      if (contentTypes.some((item: string) => item.includes('youtube'))) return "YouTube"
      if (contentTypes.some((item: string) => item.includes('tiktok'))) return "TikTok"
      if (contentTypes.some((item: string) => item.includes('facebook'))) return "Facebook"
      if (contentTypes.some((item: string) => item.includes('twitter'))) return "Twitter"
    }
    
    if (typeof contentType === 'string') {
      const contentTypeLower = contentType.toLowerCase()
      if (contentTypeLower.includes('instagram')) return "Instagram"
      if (contentTypeLower.includes('youtube')) return "YouTube"
      if (contentTypeLower.includes('tiktok')) return "TikTok"
      if (contentTypeLower.includes('facebook')) return "Facebook"
      if (contentTypeLower.includes('twitter')) return "Twitter"
    }
  } catch (error) {
    console.error('Error parsing content type:', error)
  }
  
  return "Multiple"
}

const getCategoryLabel = (value: string) => {
  if (value === "all") return "All Categories"
  return value || "Category"
}

const getPlatformLabel = (value: string) => {
  if (value === "all") return "All Platforms"
  return value || "Platform"
}

export function CampaignList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isPlatformOpen, setIsPlatformOpen] = useState(false)
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [influencerRequirements, setInfluencerRequirements] = useState<{
    followers_count?: number;
    subscribers_count?: number;
  } | null>(null)

  // Fetch campaigns from Supabase
  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user and their influencer profile
      const { data: { user } } = await supabase.auth.getUser()
      
      let influencerData = null
      if (user) {
        const { data } = await supabase
          .from('influencers')
          .select('followers_count, subscribers_count')
          .eq('influencer_id', user.id)
          .single()
        
        influencerData = data
        setInfluencerRequirements(data)
      }

      // Step 1: Fetch only application_select campaigns that are approved and active
      let query = supabase
        .from('campaigns')
        .select('*')
        .eq('selection_type', 'application_select') // Only show application_select campaigns
        .eq('admin_status', 'approved')
        .eq('status', 'active')
        .gte('campaign_timeline_end', new Date().toISOString().split('T')[0]) // Not expired
        .order('created_at', { ascending: false })

      // Filter by minimum requirements if influencer data exists
      if (influencerData) {
        if (influencerData.followers_count) {
          query = query.lte('minimum_followers', influencerData.followers_count)
        }
        if (influencerData.subscribers_count) {
          query = query.lte('minimum_subscribers', influencerData.subscribers_count)
        }
      }

      const { data: campaignsData, error: campaignsError } = await query

      if (campaignsError) {
        console.error('Campaigns fetch error:', campaignsError)
        throw campaignsError
      }

      console.log('Fetched application_select campaigns:', campaignsData?.length)

      // If no campaigns found
      if (!campaignsData || campaignsData.length === 0) {
        setCampaigns([])
        return
      }

      // Step 2: Extract unique brand IDs
      const brandIds = campaignsData
        .map(campaign => campaign.brand_id)
        .filter((id): id is string => id !== null && id !== undefined)

      // Remove duplicates
      const uniqueBrandIds = Array.from(new Set(brandIds))
      console.log('Unique brand IDs:', uniqueBrandIds)

      // Step 3: Fetch brand details
      let brandsData: User[] = []
      
      if (uniqueBrandIds.length > 0) {
        // Use eq() for each ID and combine, since .in() might fail with UUIDs
        const brandPromises = uniqueBrandIds.map(async (id) => {
          const { data, error } = await supabase
            .from('users')
            .select('id, full_name, profile_image_url, email, role')
            .eq('id', id)
            .single()

          if (error) {
            console.warn(`Error fetching user ${id}:`, error.message)
            return null
          }
          return data
        })

        const brandResults = await Promise.all(brandPromises)
        brandsData = brandResults.filter((brand): brand is User => brand !== null)
        console.log('Fetched brands:', brandsData.length)
      }

      // Step 4: Create a map for quick brand lookup
      const brandMap = new Map<string, User>()
      brandsData.forEach(brand => {
        if (brand && brand.id) {
          brandMap.set(brand.id, brand)
        }
      })

      // Step 5: Check which campaigns the user has already applied to
      let appliedCampaignIds: number[] = []
      if (user) {
        const { data: applications } = await supabase
          .from('applications')
          .select('campaign_id')
          .eq('influencer_id', user.id)

        appliedCampaignIds = applications?.map(app => app.campaign_id) || []
      }

      // Step 6: Combine campaigns with brand data and filter out applied campaigns
      const campaignsWithBrands = campaignsData
        .map(campaign => ({
          ...campaign,
          brand: brandMap.get(campaign.brand_id) || null,
          hasApplied: appliedCampaignIds.includes(campaign.campaign_id)
        }))
        .filter(campaign => !campaign.hasApplied) // Don't show campaigns user already applied to

      console.log('Final campaigns with brands:', campaignsWithBrands.length)
      setCampaigns(campaignsWithBrands)
      
    } catch (err: any) {
      console.error('Error in fetchCampaigns:', err)
      setError(err.message || 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  // Filter campaigns based on search and filters
  const filteredCampaigns = campaigns.filter((campaign) => {
    const searchLower = searchQuery.toLowerCase()
    
    // Search in multiple fields
    const matchesSearch = 
      campaign.campaign_name.toLowerCase().includes(searchLower) ||
      (campaign.brand?.full_name?.toLowerCase() || '').includes(searchLower) ||
      (campaign.campaign_description?.toLowerCase() || '').includes(searchLower) ||
      (campaign.campaign_niche?.toLowerCase() || '').includes(searchLower) ||
      (campaign.brand?.email?.toLowerCase() || '').includes(searchLower)

    // Category filter
    const matchesCategory = 
      categoryFilter === "all" || 
      (campaign.campaign_niche || '').toLowerCase() === categoryFilter.toLowerCase()

    // Platform filter
    const platform = getPlatformFromContentType(campaign.campaign_content_type)
    const matchesPlatform = 
      platformFilter === "all" || 
      platform.toLowerCase() === platformFilter.toLowerCase()

    return matchesSearch && matchesCategory && matchesPlatform
  })

  // Get unique categories from campaigns
  const categories = Array.from(
    new Set(
      campaigns
        .map((c) => c.campaign_niche)
        .filter((niche): niche is string => !!niche)
    )
  ).sort((a, b) => a.localeCompare(b))

  // Get unique platforms from campaigns
  const platforms = Array.from(
    new Set(
      campaigns.map((c) => getPlatformFromContentType(c.campaign_content_type))
    )
  ).filter((platform): platform is string => !!platform)
   .sort((a, b) => a.localeCompare(b))

  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setPlatformFilter("all")
  }

  const hasActiveFilters = searchQuery || categoryFilter !== "all" || platformFilter !== "all"

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#87599a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16">
        <p className="text-lg font-medium text-gray-900">Error loading campaigns</p>
        <p className="text-gray-500 mt-2">{error}</p>
        <button
          onClick={fetchCampaigns}
          className="mt-4 px-4 py-2 bg-[#87599a] text-white rounded-md hover:bg-[#6b4b7a] transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search campaigns, brands, or niches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#87599a] focus:border-[#87599a]"
          />
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-gray-500 hidden sm:block" />
          
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              onBlur={() => setTimeout(() => setIsCategoryOpen(false), 150)}
              className="w-[150px] px-3 py-2.5 border border-gray-300 rounded-md bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700 truncate">
                {getCategoryLabel(categoryFilter)}
              </span>
              <svg
                className={`h-4 w-4 text-gray-500 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCategoryOpen && (
              <div className="absolute z-50 mt-1 w-[150px] bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <button
                  key="all"
                  onClick={() => {
                    setCategoryFilter("all")
                    setIsCategoryOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                    categoryFilter === "all" ? "bg-[#87599a]/10 text-[#87599a]" : "text-gray-700"
                  } border-b border-gray-200`}
                >
                  All Categories
                </button>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setCategoryFilter(category)
                        setIsCategoryOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        categoryFilter === category ? "bg-[#87599a]/10 text-[#87599a]" : "text-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No categories</div>
                )}
              </div>
            )}
          </div>

          {/* Platform Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPlatformOpen(!isPlatformOpen)}
              onBlur={() => setTimeout(() => setIsPlatformOpen(false), 150)}
              className="w-[140px] px-3 py-2.5 border border-gray-300 rounded-md bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700 truncate">
                {getPlatformLabel(platformFilter)}
              </span>
              <svg
                className={`h-4 w-4 text-gray-500 transition-transform ${isPlatformOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isPlatformOpen && (
              <div className="absolute z-50 mt-1 w-[140px] bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <button
                  key="all"
                  onClick={() => {
                    setPlatformFilter("all")
                    setIsPlatformOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                    platformFilter === "all" ? "bg-[#87599a]/10 text-[#87599a]" : "text-gray-700"
                  } border-b border-gray-200`}
                >
                  All Platforms
                </button>
                {platforms.length > 0 ? (
                  platforms.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => {
                        setPlatformFilter(platform)
                        setIsPlatformOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        platformFilter === platform ? "bg-[#87599a]/10 text-[#87599a]" : "text-gray-700"
                      }`}
                    >
                      {platform}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No platforms</div>
                )}
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-[#87599a] hover:text-[#6b4b7a] hover:bg-[#87599a]/10 rounded-md transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Campaign Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredCampaigns.length}</span> of{" "}
          <span className="font-semibold">{campaigns.length}</span> application campaigns
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-[#87599a] hover:text-[#6b4b7a] hover:bg-[#87599a]/10 px-3 py-1 rounded-md transition-colors self-start sm:self-auto"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Campaign Cards or No Results */}
      {filteredCampaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16">
          <p className="text-lg font-medium text-gray-900">No application campaigns found</p>
          <p className="text-gray-500 mt-1 text-center">
            {hasActiveFilters 
              ? "Try adjusting your search or filters" 
              : influencerRequirements 
                ? "No campaigns match your current follower/subscriber count"
                : "No campaigns accepting applications at the moment"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          )}
          {!hasActiveFilters && campaigns.length === 0 && (
            <button
              onClick={fetchCampaigns}
              className="mt-4 px-4 py-2 bg-[#87599a] text-white rounded-md hover:bg-[#6b4b7a] transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard 
              key={campaign.campaign_id} 
              campaign={campaign as Campaign} 
            />
          ))}
        </div>
      )}
    </div>
  )
}