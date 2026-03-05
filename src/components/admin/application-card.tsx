"use client"

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

interface ApplicationCardProps {
  application: Application
  campaignBudget: number
  isLowestBid: boolean
  isHighestEngagement: boolean
  isSelectedForCompare: boolean
  onApprove: () => void
  onReject: () => void
  onToggleCompare: () => void
}

export function ApplicationCard({
  application,
  campaignBudget,
  isLowestBid,
  isHighestEngagement,
  isSelectedForCompare,
  onApprove,
  onReject,
  onToggleCompare,
}: ApplicationCardProps) {
  const { influencer, bidAmount, proposedDeliverables, estimatedReach, appliedAt, status, message } = application

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

  const budgetPercentage = ((bidAmount / campaignBudget) * 100).toFixed(1)

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    approved: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
  }

  // Icons as SVG components
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

  const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )

  const AwardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  )

  const GitCompareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <path d="M11 18H8a2 2 0 0 1-2-2V9" />
    </svg>
  )

  const MessageSquareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )

  const [showMessage, setShowMessage] = useState(false)

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 ${isSelectedForCompare ? "ring-2 ring-blue-500" : "hover:shadow-md"}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full border-2 border-gray-200 overflow-hidden">
              <img 
                src={influencer.avatar || "/placeholder.svg"} 
                alt={influencer.name}
                className="h-full w-full object-cover"
              />
              <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500">
                {influencer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{influencer.name}</h3>
                {isLowestBid && (
                  <span className="inline-flex items-center rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-800">
                    Best Bid
                  </span>
                )}
                {isHighestEngagement && (
                  <span className="inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-800">
                    Top Engagement
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{influencer.handle}</p>
            </div>
          </div>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Removed Followers stat */}
          {/* Removed Engagement stat */}
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2.5">
            <DollarSignIcon />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Bid Amount</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(bidAmount)}</p>
            </div>
          </div>
          {/* Removed Estimated Reach stat */}
        </div>

        <div className="rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Proposed Deliverables</p>
          <p className="text-sm text-gray-900">{proposedDeliverables}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <AwardIcon />
            {influencer.niche}
          </span>
          <span>{budgetPercentage}% of budget</span>
        </div>
      </div>
      <div className="p-4 pt-0 flex items-center gap-2">
        {status === "pending" ? (
          <>
            <button 
              onClick={onApprove} 
              className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <CheckIcon />
              Approve
            </button>
            <button 
              onClick={onReject} 
              className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-transparent px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <XIcon />
              Reject
            </button>
          </>
        ) : (
          <div className="flex-1 text-center text-sm text-gray-500">
            {status === "approved" ? "Application Approved" : "Application Rejected"}
          </div>
        )}
        <button
          onClick={onToggleCompare}
          className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isSelectedForCompare 
              ? "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500" 
              : "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
          }`}
        >
          <GitCompareIcon />
        </button>
        <button 
          onClick={() => setShowMessage(true)}
          className="flex items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-transparent px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <MessageSquareIcon />
        </button>
      </div>

      {/* Message Dialog */}
      {showMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Application Message</h3>
                <p className="text-sm text-gray-500">Message from {influencer.name}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 mb-4">
                <p className="text-sm text-gray-900">{message}</p>
              </div>
              <p className="text-xs text-gray-500">
                Applied on{" "}
                {new Date(appliedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowMessage(false)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Need to add useState import at the top
import { useState } from 'react'