"use client"

import { Search } from "lucide-react"
import { useState } from "react"

interface CampaignFiltersProps {
  statusFilter: string
  setStatusFilter: (value: string) => void
  adminStatusFilter: string
  setAdminStatusFilter: (value: string) => void
  searchQuery: string
  setSearchQuery: (value: string) => void
}

export function CampaignFilters({
  statusFilter,
  setStatusFilter,
  adminStatusFilter,
  setAdminStatusFilter,
  searchQuery,
  setSearchQuery,
}: CampaignFiltersProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isAdminStatusOpen, setIsAdminStatusOpen] = useState(false)

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]

  const adminStatusOptions = [
    { value: "all", label: "All Admin Status" },
    { value: "pending", label: "Pending Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ]

  const getStatusLabel = (value: string) => {
    return statusOptions.find(opt => opt.value === value)?.label || "Campaign Status"
  }

  const getAdminStatusLabel = (value: string) => {
    return adminStatusOptions.find(opt => opt.value === value)?.label || "Admin Status"
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Status Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsStatusOpen(!isStatusOpen)}
          className="w-full sm:w-[180px] px-4 py-2 border border-gray-300 rounded-md bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-700">{getStatusLabel(statusFilter)}</span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isStatusOpen && (
          <div className="absolute z-10 mt-1 w-full sm:w-[180px] bg-white border border-gray-300 rounded-md shadow-lg">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setStatusFilter(option.value)
                  setIsStatusOpen(false)
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  statusFilter === option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"
                } ${option.value === "all" ? "border-b border-gray-200" : ""}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Admin Status Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsAdminStatusOpen(!isAdminStatusOpen)}
          className="w-full sm:w-[180px] px-4 py-2 border border-gray-300 rounded-md bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-700">{getAdminStatusLabel(adminStatusFilter)}</span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${isAdminStatusOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isAdminStatusOpen && (
          <div className="absolute z-10 mt-1 w-full sm:w-[180px] bg-white border border-gray-300 rounded-md shadow-lg">
            {adminStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setAdminStatusFilter(option.value)
                  setIsAdminStatusOpen(false)
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  adminStatusFilter === option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"
                } ${option.value === "all" ? "border-b border-gray-200" : ""}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}