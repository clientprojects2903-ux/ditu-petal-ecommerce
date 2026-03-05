// app/dashboard/influencer/invite/InvitationList.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface Campaign {
  campaign_id: number
  // Try multiple possible field names
  title?: string | null
  name?: string | null
  campaign_name?: string | null
  description: string
  requirements: string | null
  budget: number | null
  deadline: string | null
  status: string
}

interface Brand {
  id: string
  full_name: string | null
  email: string
  brand_name: string | null
  company_name?: string | null
  avatar_url: string | null
}

interface Invitation {
  invitation_id: string
  campaign_id: number
  brand_id: string
  influencer_id: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  invited_at: string
  responded_at: string | null
  campaign: Campaign
  brand: Brand
}

interface InvitationListProps {
  initialInvitations: Invitation[]
  userId: string
}

type FilterStatus = 'all' | 'pending' | 'accepted' | 'declined'

export default function InvitationList({ 
  initialInvitations, 
  userId 
}: InvitationListProps) {
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations)
  const [responding, setResponding] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const supabase = createClient()

  // Helper function to get campaign name from multiple possible fields
  const getCampaignName = (campaign: Campaign): string => {
    return campaign.title || campaign.name || campaign.campaign_name || 'Untitled Campaign'
  }

  // Helper function to get brand name from multiple possible fields
  const getBrandName = (brand: Brand): string => {
    return brand.brand_name || brand.company_name || brand.full_name || 'Brand'
  }

  const filteredInvitations = invitations.filter(invitation => {
    if (filter === 'all') return true
    return invitation.status === filter
  })

  const handleResponse = async (invitationId: string, status: 'accepted' | 'declined') => {
    setResponding(invitationId)
    
    try {
      // Double-check that this invitation belongs to the current user
      const invitation = invitations.find(inv => inv.invitation_id === invitationId)
      if (invitation?.influencer_id !== userId) {
        throw new Error('You can only respond to your own invitations')
      }

      const { error } = await supabase
        .from('campaign_invitations')
        .update({
          status,
          responded_at: new Date().toISOString()
        })
        .eq('invitation_id', invitationId)
        .eq('influencer_id', userId)

      if (error) throw error

      setInvitations(prev =>
        prev.map(inv =>
          inv.invitation_id === invitationId
            ? { ...inv, status, responded_at: new Date().toISOString() }
            : inv
        )
      )

    } catch (error) {
      console.error('Error responding to invitation:', error)

    } finally {
      setResponding(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No invitations</h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't received any campaign invitations yet.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['all', 'pending', 'accepted', 'declined'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                ${filter === status
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {status}
            </button>
          ))}
        </nav>
      </div>

      {/* Invitations list */}
      <div className="space-y-6">
        {filteredInvitations.map((invitation) => (
          <div
            key={invitation.invitation_id}
            className="bg-white shadow overflow-hidden sm:rounded-lg"
          >
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Brand avatar */}
                  <div className="flex-shrink-0">
                    {invitation.brand.avatar_url ? (
                      <img
                        className="h-12 w-12 rounded-full"
                        src={invitation.brand.avatar_url}
                        alt={getBrandName(invitation.brand)}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {getBrandName(invitation.brand).charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Brand and campaign info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {getCampaignName(invitation.campaign)}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                      <span>by {getBrandName(invitation.brand)}</span>
                      <span>•</span>
                      <span>Invited {formatDistanceToNow(new Date(invitation.invited_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(invitation.status)}`}>
                    {invitation.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Campaign Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {invitation.campaign.description || 'No description provided'}
                  </dd>
                </div>

                {invitation.campaign.requirements && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Requirements</dt>
                    <dd className="mt-1 text-sm text-gray-900">{invitation.campaign.requirements}</dd>
                  </div>
                )}

                {invitation.campaign.budget && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Budget</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ${invitation.campaign.budget.toLocaleString()}
                    </dd>
                  </div>
                )}

                {invitation.campaign.deadline && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(invitation.campaign.deadline).toLocaleDateString()}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-500">Brand Contact</dt>
                  <dd className="mt-1 text-sm text-gray-900">{invitation.brand.email}</dd>
                </div>
              </dl>

              {/* Action buttons - only show for pending invitations */}
              {invitation.status === 'pending' && (
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => handleResponse(invitation.invitation_id, 'accepted')}
                    disabled={responding === invitation.invitation_id}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {responding === invitation.invitation_id ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleResponse(invitation.invitation_id, 'declined')}
                    disabled={responding === invitation.invitation_id}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              )}

              {invitation.responded_at && (
                <div className="mt-4 text-sm text-gray-500">
                  Responded {formatDistanceToNow(new Date(invitation.responded_at), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}