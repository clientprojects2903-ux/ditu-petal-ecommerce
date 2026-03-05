"use client"

import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import type { Campaign } from "./campaign-dashboard"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface CampaignTableProps {
  campaigns: Campaign[]
  onEdit: (campaign: Campaign) => void
  onDelete: (campaignId: number) => void
}

export function CampaignTable({ campaigns, onEdit, onDelete }: CampaignTableProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null)
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-[#f0e6f5] text-[#87599a] border-[#e0d0e8]",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-teal-100 text-teal-800 border-teal-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getAdminStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatBudget = (budget: number | null) => {
    if (!budget) return "-"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget)
  }

  const handleViewDetails = (campaignId: number) => {
    router.push(`/campaign/${campaignId}`)
    setIsDropdownOpen(null)
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-[#e0d0e8] rounded-lg bg-[#f8f5fa]">
        <p className="text-[#6b4f73]">No campaigns found</p>
        <p className="text-sm text-[#a58bb3] mt-1">Try adjusting your filters or create a new campaign</p>
      </div>
    )
  }

  return (
    <>
      <div className="border border-[#e0d0e8] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f5fa]">
              <tr className="border-b border-[#e0d0e8]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#4a2c4d]">Campaign</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#4a2c4d] hidden md:table-cell">Niche</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#4a2c4d] hidden lg:table-cell">Budget</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#4a2c4d] hidden lg:table-cell">Timeline</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#4a2c4d]">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#4a2c4d] hidden sm:table-cell">Admin</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#4a2c4d] w-[70px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.campaign_id} className="border-b border-[#e0d0e8] last:border-0 hover:bg-[#f8f5fa] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleViewDetails(campaign.campaign_id)}
                        className="font-medium text-[#4a2c4d] hover:text-[#87599a] text-left transition-colors"
                      >
                        {campaign.campaign_name}
                      </button>
                      <span className="text-sm text-[#6b4f73] line-clamp-1">
                        {campaign.campaign_description || "No description"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#4a2c4d] hidden md:table-cell">{campaign.campaign_niche || "-"}</td>
                  <td className="py-4 px-4 text-[#4a2c4d] hidden lg:table-cell">{formatBudget(campaign.campaign_budget)}</td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <span className="text-sm text-[#6b4f73]">
                      {formatDate(campaign.campaign_timeline_start)} - {formatDate(campaign.campaign_timeline_end)}
                    </span>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(campaign.status)}</td>
                  <td className="py-4 px-4 hidden sm:table-cell">{getAdminStatusBadge(campaign.admin_status)}</td>
                  <td className="py-4 px-4 relative">
                    <button
                      onClick={() => setIsDropdownOpen(isDropdownOpen === campaign.campaign_id ? null : campaign.campaign_id)}
                      className="h-8 w-8 rounded-md hover:bg-[#f0e6f5] flex items-center justify-center transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4 text-[#87599a]" />
                      <span className="sr-only">Open menu</span>
                    </button>
                    
                    {isDropdownOpen === campaign.campaign_id && (
                      <div className="absolute z-10 mt-1 right-4 bg-white border border-[#e0d0e8] rounded-md shadow-lg min-w-[160px]">
                        <button
                          onClick={() => handleViewDetails(campaign.campaign_id)}
                          className="w-full px-4 py-2 text-left text-[#4a2c4d] hover:bg-[#f8f5fa] flex items-center gap-2 transition-colors"
                        >
                          <Eye className="h-4 w-4 text-[#87599a]" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            onEdit(campaign)
                            setIsDropdownOpen(null)
                          }}
                          className="w-full px-4 py-2 text-left text-[#4a2c4d] hover:bg-[#f8f5fa] flex items-center gap-2 transition-colors"
                        >
                          <Pencil className="h-4 w-4 text-[#87599a]" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete(campaign.campaign_id)
                            setIsDropdownOpen(null)
                          }}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-[#f8f5fa] flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}