// app/campaign/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Calendar, DollarSign, Users, MapPin, Clock, Target, CheckCircle, XCircle, AlertCircle, ArrowLeft, Instagram, Twitter, FileText, Image, Video, Music, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import BrandImage from '@/components/brand/BrandImage'

interface CampaignDetails {
  campaign_id: number
  brand_id: string
  influencer_id: string[] | null
  campaign_name: string
  campaign_description: string | null
  campaign_budget: number | null
  campaign_content_type: any
  campaign_timeline_start: string | null
  campaign_timeline_end: string | null
  minimum_followers: number
  minimum_subscribers: number
  campaign_niche: string | null
  status: string
  created_at: string
  updated_at: string
  admin_status: string
  selection_type: string
  brand?: {
    id: string
    full_name: string
    email: string
    about: string | null
    city: string | null
    state: string | null
    country: string | null
    profile_image_url: string | null
    instagram_url: string | null
    x_url: string | null
  } | null
}

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const numericId = parseInt(id)
  
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('campaign_id', numericId)
    .single()

  if (error || !campaign) notFound()

  let brandData = null
  if (campaign.brand_id) {
    const { data: brand } = await supabase
      .from('users')
      .select('id, full_name, email, about, city, state, country, profile_image_url, instagram_url, x_url')
      .eq('id', campaign.brand_id)
      .single()

    brandData = brand
  }

  // Fetch selected influencers data if any
  let selectedInfluencers: any[] = []
  if (campaign.influencer_id && campaign.influencer_id.length > 0) {
    const { data: influencers } = await supabase
      .from('users')
      .select('id, full_name, email, profile_image_url, city, state, country, instagram_url, x_url')
      .in('id', campaign.influencer_id)

    selectedInfluencers = influencers || []
  }

  const typedCampaign: CampaignDetails = {
    ...campaign,
    brand: brandData
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string, icon: any }> = {
      approved: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
      pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
      rejected: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
      completed: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle }
    }
    return configs[status.toLowerCase()] || { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: AlertCircle }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Not specified'
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Function to render content requirements properly
  const renderContentRequirements = (contentType: any) => {
    if (!contentType) return null;

    // If it's a string, try to parse it
    if (typeof contentType === 'string') {
      try {
        contentType = JSON.parse(contentType);
      } catch {
        return <p className="text-gray-600">{contentType}</p>;
      }
    }

    // If it's an array, map through items
    if (Array.isArray(contentType)) {
      return (
        <div className="space-y-4">
          {contentType.map((item, index) => (
            <div key={index} className="border-l-2 border-[#87599a] pl-4">
              {typeof item === 'string' ? (
                <p className="text-gray-700">{item}</p>
              ) : (
                renderContentObject(item)
              )}
            </div>
          ))}
        </div>
      );
    }

    // If it's an object, render key-value pairs
    if (typeof contentType === 'object' && contentType !== null) {
      return renderContentObject(contentType);
    }

    return <p className="text-gray-600">No content requirements specified</p>;
  };

  // Helper function to render content object
  const renderContentObject = (obj: any) => {
    return (
      <div className="space-y-3">
        {Object.entries(obj).map(([key, value]) => {
          // Skip empty values
          if (!value) return null;

          // Get appropriate icon based on key
          const getIcon = () => {
            const keyLower = key.toLowerCase();
            if (keyLower.includes('image') || keyLower.includes('photo') || keyLower.includes('picture')) {
              return <Image className="w-4 h-4 text-[#87599a]" />;
            } else if (keyLower.includes('video') || keyLower.includes('reel')) {
              return <Video className="w-4 h-4 text-[#87599a]" />;
            } else if (keyLower.includes('audio') || keyLower.includes('music') || keyLower.includes('podcast')) {
              return <Music className="w-4 h-4 text-[#87599a]" />;
            } else if (keyLower.includes('link') || keyLower.includes('url')) {
              return <LinkIcon className="w-4 h-4 text-[#87599a]" />;
            } else if (keyLower.includes('caption') || keyLower.includes('text') || keyLower.includes('description')) {
              return <FileText className="w-4 h-4 text-[#87599a]" />;
            }
            return <FileText className="w-4 h-4 text-[#87599a]" />;
          };

          // Format key for display
          const formatKey = (key: string) => {
            return key
              .replace(/_/g, ' ')
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase())
              .trim();
          };

          // Handle different value types
          if (typeof value === 'object' && value !== null) {
            return (
              <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  {getIcon()}
                  {formatKey(key)}
                </h4>
                <div className="ml-6">
                  {renderContentObject(value)}
                </div>
              </div>
            );
          }

          // Handle boolean values
          if (typeof value === 'boolean') {
            return (
              <div key={key} className="flex items-start gap-2">
                {getIcon()}
                <div>
                  <span className="font-medium text-gray-700">{formatKey(key)}:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {value ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>
            );
          }

          // Handle arrays
          if (Array.isArray(value)) {
            return (
              <div key={key} className="flex items-start gap-2">
                {getIcon()}
                <div className="flex-1">
                  <span className="font-medium text-gray-700 block mb-1">{formatKey(key)}:</span>
                  <div className="flex flex-wrap gap-2">
                    {value.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          // Default text value
          return (
            <div key={key} className="flex items-start gap-2">
              {getIcon()}
              <div>
                <span className="font-medium text-gray-700">{formatKey(key)}:</span>
                <span className="ml-2 text-gray-600">{String(value)}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/dashboard/brand/campaign/view"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{typedCampaign.campaign_name}</h1>
                <p className="text-sm text-gray-500 mt-1">ID: #{typedCampaign.campaign_id}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const adminConfig = getStatusConfig(typedCampaign.admin_status)
                  const AdminIcon = adminConfig.icon
                  return (
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${adminConfig.color}`}>
                      <AdminIcon className="w-3.5 h-3.5 mr-1.5" />
                      Admin: {typedCampaign.admin_status}
                    </span>
                  )
                })()}
                {(() => {
                  const statusConfig = getStatusConfig(typedCampaign.status)
                  const StatusIcon = statusConfig.icon
                  return (
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                      {typedCampaign.status}
                    </span>
                  )
                })()}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Brand Section */}
            {typedCampaign.brand && (
              <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                {/* Fixed: Removed className prop from BrandImage */}
                <BrandImage 
                  src={typedCampaign.brand.profile_image_url}
                  alt={typedCampaign.brand.full_name || 'Brand'}
                />
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{typedCampaign.brand.full_name}</h3>
                      <p className="text-sm text-gray-600">{typedCampaign.brand.email}</p>
                      {(typedCampaign.brand.city || typedCampaign.brand.country) && (
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {[typedCampaign.brand.city, typedCampaign.brand.state, typedCampaign.brand.country]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {typedCampaign.brand.instagram_url && (
                        <a
                          href={typedCampaign.brand.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-[#87599a] transition-colors"
                          aria-label="Instagram"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {typedCampaign.brand.x_url && (
                        <a
                          href={typedCampaign.brand.x_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-[#87599a] transition-colors"
                          aria-label="X (Twitter)"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  {typedCampaign.brand.about && (
                    <p className="text-sm text-gray-600 mt-2">{typedCampaign.brand.about}</p>
                  )}
                </div>
              </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-600 mb-1">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="text-xs uppercase tracking-wider">Budget</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(typedCampaign.campaign_budget)}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-600 mb-1">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="text-xs uppercase tracking-wider">Min. Followers</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{typedCampaign.minimum_followers.toLocaleString()}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-600 mb-1">
                  <Target className="w-4 h-4 mr-1" />
                  <span className="text-xs uppercase tracking-wider">Selection</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 capitalize">{typedCampaign.selection_type.replace('_', ' ')}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-600 mb-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="text-xs uppercase tracking-wider">Timeline</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(typedCampaign.campaign_timeline_start)} - {formatDate(typedCampaign.campaign_timeline_end)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Description</h2>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                {typedCampaign.campaign_description || 'No description provided.'}
              </p>
            </div>

            {/* Content Requirements - Now showing properly formatted */}
            {typedCampaign.campaign_content_type && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-[#87599a]" />
                  Content Requirements
                </h2>
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  {renderContentRequirements(typedCampaign.campaign_content_type)}
                </div>
              </div>
            )}

            {/* Selected Influencers - Now showing properly with details */}
            {selectedInfluencers.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-[#87599a]" />
                  Selected Influencers ({selectedInfluencers.length})
                </h2>
                <div className="grid gap-3">
                  {selectedInfluencers.map((influencer) => (
                    <div key={influencer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {/* Fixed: Removed className prop from BrandImage */}
                      <BrandImage
                        src={influencer.profile_image_url}
                        alt={influencer.full_name || 'Influencer'}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{influencer.full_name}</p>
                            <p className="text-sm text-gray-600">{influencer.email}</p>
                          </div>
                          <div className="flex gap-2">
                            {influencer.instagram_url && (
                              <a
                                href={influencer.instagram_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#87599a] transition-colors"
                              >
                                <Instagram className="w-4 h-4" />
                              </a>
                            )}
                            {influencer.x_url && (
                              <a
                                href={influencer.x_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#87599a] transition-colors"
                              >
                                <Twitter className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                        {(influencer.city || influencer.country) && (
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {[influencer.city, influencer.state, influencer.country]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-4 text-xs text-gray-500 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Created {formatDate(typedCampaign.created_at)}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Updated {formatDate(typedCampaign.updated_at)}
                </span>
              </div>
              {typedCampaign.campaign_niche && (
                <span className="text-gray-600">Niche: {typedCampaign.campaign_niche}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add this helper component at the bottom or import from lucide
const ChevronDown = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)