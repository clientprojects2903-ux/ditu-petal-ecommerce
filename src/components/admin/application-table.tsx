"use client"
import { useState } from "react"

// Types from your data.ts
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

interface ApplicationTableProps {
  applications: Application[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

// Icon components
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const DollarSignIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const CheckIconSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export function ApplicationTable({
  applications,
  selectedIds,
  onSelectionChange,
  onApprove,
  onReject,
}: ApplicationTableProps) {
  const [tooltip, setTooltip] = useState<{ show: boolean; text: string; x: number; y: number } | null>(null)

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K"
    }
    return num.toString()
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const toggleAll = () => {
    if (selectedIds.length === applications.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(applications.map((app) => app.id))
    }
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    approved: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
  }

  // Find best bid (lowest cost per reach)
  const costPerReach = applications.map((app) => ({
    id: app.id,
    cpr: app.bidAmount / app.estimatedReach,
  }))
  const bestBidId = costPerReach.sort((a, b) => a.cpr - b.cpr)[0]?.id

  const showTooltip = (text: string, event: React.MouseEvent) => {
    setTooltip({
      show: true,
      text,
      x: event.clientX,
      y: event.clientY,
    })
  }

  const hideTooltip = () => {
    setTooltip(null)
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="w-12 px-4 py-3 text-left">
                  <button
                    onClick={toggleAll}
                    className={`h-4 w-4 rounded border ${selectedIds.length === applications.length && applications.length > 0 ? "bg-blue-600 border-blue-600" : "border-gray-300"} flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    aria-label={selectedIds.length === applications.length ? "Deselect all" : "Select all"}
                  >
                    {selectedIds.length === applications.length && applications.length > 0 && (
                      <CheckIconSmall />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Influencer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-1">
                    <UsersIcon />
                    Followers
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-1">
                    <TrendingUpIcon />
                    Engagement
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-1">
                    <DollarSignIcon />
                    Bid Amount
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Est. Reach</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr
                  key={application.id}
                  className={`border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedIds.includes(application.id) ? "bg-blue-50" : ""
                  } ${application.id === bestBidId ? "bg-green-50" : ""} hover:bg-gray-50`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelection(application.id)}
                      className={`h-4 w-4 rounded border ${selectedIds.includes(application.id) ? "bg-blue-600 border-blue-600" : "border-gray-300"} flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      aria-label={selectedIds.includes(application.id) ? `Deselect ${application.influencer.name}` : `Select ${application.influencer.name}`}
                    >
                      {selectedIds.includes(application.id) && <CheckIconSmall />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full border-2 border-gray-200 overflow-hidden">
                        <img
                          src={application.influencer.avatar || "/placeholder.svg"}
                          alt={application.influencer.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                          {application.influencer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{application.influencer.name}</div>
                        <div className="text-sm text-gray-500">{application.influencer.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {formatNumber(application.influencer.followers)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {application.influencer.engagementRate}%
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(application.bidAmount)}
                      {application.id === bestBidId && (
                        <span 
                          className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500"
                          onMouseEnter={(e) => showTooltip("Best bid (lowest cost per reach)", e)}
                          onMouseLeave={hideTooltip}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {formatNumber(application.estimatedReach)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[application.status]}`}
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {application.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onApprove(application.id)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          title="Approve application"
                        >
                          <CheckIcon />
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(application.id)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          title="Reject application"
                        >
                          <XIcon />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        {application.status === "approved" ? "Approved" : "Rejected"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y + 10}px`,
            transform: 'translateY(-100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  )
}