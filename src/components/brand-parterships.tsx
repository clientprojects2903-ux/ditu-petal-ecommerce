'use client'
import { AlertCircle, DollarSign, Calendar, Users, Tag } from "lucide-react"
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

// Campaign Interface for the query
interface Campaign {
  campaign_id: number
  brand_id: string
  influencer_id: string[] | null
  status: string | null
  admin_status: string | null
  campaign_budget: number | null
  campaign_niche: string | null
  created_at: string
  updated_at: string
}
  
// Brand Interface
interface Brand {
  brand_id: string
  brand_name: string
  brand_email?: string
  campaigns_count: number
  total_earnings: number
  last_campaign_date: string | null
  campaign_niches: string[]
  status: 'active' | 'new' | 'inactive'
}

// BrandPartnerships Component
export function BrandPartnerships() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null)

  useEffect(() => {
    fetchBrandPartnerships()
  }, [])

  const fetchBrandPartnerships = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError("Please log in to view brand partnerships")
        setLoading(false)
        return
      }

      // 2. Fetch all campaigns for this influencer
      // Fixed: Using contains for array and selecting necessary fields
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          campaign_id,
          brand_id,
          influencer_id,
          status,
          admin_status,
          campaign_budget,
          campaign_niche,
          created_at,
          updated_at
        `)
        .contains('influencer_id', [user.id])

      if (campaignsError) {
        console.error("Error fetching campaigns:", campaignsError)
        setError("Failed to load brand partnerships")
        setLoading(false)
        return
      }

      console.log("Fetched campaigns for brands:", campaignsData)

      // 3. Group campaigns by brand_id and calculate statistics
      const brandMap = new Map<string, Brand>()

      campaignsData?.forEach((campaign: Campaign) => {
        const brandId = campaign.brand_id
        
        if (!brandMap.has(brandId)) {
          brandMap.set(brandId, {
            brand_id: brandId,
            brand_name: '',
            campaigns_count: 0,
            total_earnings: 0,
            last_campaign_date: null,
            campaign_niches: [],
            status: 'inactive'
          })
        }
        
        const brand = brandMap.get(brandId)!
        
        // Increment campaign count (only count completed or active campaigns)
        // You can adjust this logic based on your business rules
        const isCompleted = 
          campaign.status?.toLowerCase() === 'completed' || 
          campaign.status?.toLowerCase() === 'finished' ||
          campaign.admin_status?.toLowerCase() === 'completed'
        
        const isActive = 
          campaign.status?.toLowerCase() === 'active' ||
          campaign.status?.toLowerCase() === 'in_progress' ||
          campaign.admin_status?.toLowerCase() === 'approved'
        
        // Count all campaigns except rejected/blocked ones
        const isRejected = campaign.admin_status?.toLowerCase() === 'rejected'
        
        if (!isRejected) {
          brand.campaigns_count += 1
        }
        
        // Add earnings for completed campaigns only (or adjust as needed)
        if (campaign.campaign_budget && isCompleted) {
          brand.total_earnings += campaign.campaign_budget
        }
        
        // Update last campaign date (use the most recent date)
        const campaignDate = campaign.updated_at || campaign.created_at
        if (campaignDate && (!brand.last_campaign_date || campaignDate > brand.last_campaign_date)) {
          brand.last_campaign_date = campaignDate
        }
        
        // Add niche if not already in array and campaign is valid
        if (campaign.campaign_niche && !isRejected) {
          const niche = campaign.campaign_niche
          if (!brand.campaign_niches.includes(niche)) {
            brand.campaign_niches.push(niche)
          }
        }
      })

      // 4. Convert map to array and sort by most recent/largest partnerships
      const brandsArray = Array.from(brandMap.values())
        .sort((a, b) => {
          // Sort by last campaign date first (most recent)
          if (a.last_campaign_date && b.last_campaign_date) {
            return b.last_campaign_date.localeCompare(a.last_campaign_date)
          }
          // Then by total earnings
          if (b.total_earnings !== a.total_earnings) {
            return b.total_earnings - a.total_earnings
          }
          // Then by campaign count
          return b.campaigns_count - a.campaigns_count
        })
        .slice(0, 6) // Limit to 6 brands for display

      // 5. Get brand details from users table
      const brandsWithDetails = await Promise.all(
        brandsArray.map(async (brand) => {
          const { data: brandData } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', brand.brand_id)
            .single()

          // Determine status based on recent activity
          let status: 'active' | 'new' | 'inactive' = 'inactive'
          if (brand.last_campaign_date) {
            const lastCampaign = new Date(brand.last_campaign_date)
            const now = new Date()
            const diffDays = Math.floor((now.getTime() - lastCampaign.getTime()) / (1000 * 60 * 60 * 24))
            
            if (diffDays <= 30) {
              status = brand.campaigns_count <= 2 ? 'new' : 'active'
            }
          } else if (brand.campaigns_count > 0) {
            // If no last campaign date but has campaigns, consider it active
            status = 'active'
          }

          return {
            ...brand,
            brand_name: brandData?.full_name || brandData?.email?.split('@')[0] || `Brand ${brand.brand_id.substring(0, 8)}`,
            brand_email: brandData?.email,
            status
          }
        })
      )

      setBrands(brandsWithDetails)
      console.log("Brand partnerships fetched:", brandsWithDetails)

    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Format currency to Indian Rupees
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "No campaigns"
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
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
    
    let hash = 0
    for (let i = 0; i < brandId.length; i++) {
      hash = brandId.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  // Get status color
  const getStatusColor = (status: string): { bg: string; text: string; variant: "default" | "success" | "warning" | "secondary" } => {
    switch (status) {
      case 'active':
        return { bg: "bg-emerald-100", text: "text-emerald-700", variant: "success" as const }
      case 'new':
        return { bg: "bg-blue-100", text: "text-blue-700", variant: "default" as const }
      case 'inactive':
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", variant: "secondary" as const }
    }
  }

  // Get brand initials
  const getBrandInitials = (brandName: string): string => {
    return brandName
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Get primary niche
  const getPrimaryNiche = (niches: string[]): string => {
    return niches.length > 0 ? niches[0] : "General"
  }

  const handleBrandClick = (brandId: string) => {
    console.log(`Clicked brand ${brandId}`)
    // You can implement navigation to brand details page here
    // router.push(`/brands/${brandId}`)
  }

  // Handle loading state
  if (loading) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Brand Partnerships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Brand Partnerships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <p className="text-gray-600 mb-2">{error}</p>
            <button
              onClick={fetchBrandPartnerships}
              className="text-sm px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (brands.length === 0) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Brand Partnerships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 mb-2">No brand partnerships yet</p>
            <p className="text-sm text-gray-500">Brands you've worked with will appear here</p>
            <button
              onClick={fetchBrandPartnerships}
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
        <CardTitle className="text-lg font-semibold text-gray-900">Brand Partnerships</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {brands.map((brand) => {
            const brandColor = getBrandColor(brand.brand_id)
            const statusColor = getStatusColor(brand.status)
            const brandInitials = getBrandInitials(brand.brand_name)
            const primaryNiche = getPrimaryNiche(brand.campaign_niches)
            
            return (
              <div
                key={brand.brand_id}
                className={`flex items-center gap-3 rounded-lg border ${
                  hoveredBrand === brand.brand_id 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                } p-3 transition-all duration-200 cursor-pointer hover:shadow-sm`}
                onMouseEnter={() => setHoveredBrand(brand.brand_id)}
                onMouseLeave={() => setHoveredBrand(null)}
                onClick={() => handleBrandClick(brand.brand_id)}
              >
                {/* Brand Logo/Avatar */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg font-semibold text-sm ${brandColor.bg} ${brandColor.text}`}
                >
                  {brandInitials}
                </div>
                
                {/* Brand Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 truncate" title={brand.brand_name}>
                      {brand.brand_name}
                    </h4>
                    <Badge variant={statusColor.variant} className={`${statusColor.bg} ${statusColor.text}`}>
                      {brand.status.charAt(0).toUpperCase() + brand.status.slice(1)}
                    </Badge>
                  </div>
                  
                  {/* Brand Info */}
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 truncate">
                      {primaryNiche}
                      {brand.campaign_niches.length > 1 && ` +${brand.campaign_niches.length - 1} more`}
                    </span>
                  </div>
                  
                  {/* Stats */}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="h-3 w-3" />
                      <span>{brand.campaigns_count} campaign{brand.campaigns_count !== 1 ? 's' : ''}</span>
                    </div>
                    
                    {brand.last_campaign_date && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(brand.last_campaign_date)}</span>
                      </div>
                    )}

                    {/* Optional: Show earnings if you want */}
                    {/* {brand.total_earnings > 0 && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign className="h-3 w-3" />
                        <span>{formatCurrency(brand.total_earnings)}</span>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Simplified Summary Stats - Only campaign count */}
        {brands.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium">{brands.length}</span> brand partners
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-medium">
                  {brands.reduce((total, brand) => total + brand.campaigns_count, 0)} total campaigns
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}