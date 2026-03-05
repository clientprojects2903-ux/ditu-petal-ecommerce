"use client"

import { Search, Filter, Calendar } from "lucide-react"
import { useState } from "react"

export function CampaignFilters() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ]

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "social", label: "Social Media" },
    { value: "email", label: "Email" },
    { value: "display", label: "Display Ads" },
    { value: "video", label: "Video" },
  ]

  const getStatusLabel = (value: string) => {
    return statusOptions.find(opt => opt.value === value)?.label || "Status"
  }

  const getCategoryLabel = (value: string) => {
    return categoryOptions.find(opt => opt.value === value)?.label || "Category"
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search campaigns..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Status Filter Dropddown */}
      <div className="relative">
        <button
          onClick={() => setIsStatusOpen(!isStatusOpen)}
          className="w-full sm:w-[180px] px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <span className="text-gray-700">{getStatusLabel(statusFilter)}</span>
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
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

      {/* Category Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="w-full sm:w-[180px] px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <span className="text-gray-700">{getCategoryLabel(categoryFilter)}</span>
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
          <div className="absolute z-10 mt-1 w-full sm:w-[180px] bg-white border border-gray-300 rounded-md shadow-lg">
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setCategoryFilter(option.value)
                  setIsCategoryOpen(false)
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  categoryFilter === option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"
                } ${option.value === "all" ? "border-b border-gray-200" : ""}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date Range Button */}
      <button className="px-4 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-700" />
        <span className="text-gray-700">Date Range</span>
      </button>

      {/* More Filters Button */}
      <button className="px-4 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-700" />
        <span className="text-gray-700">More Filters</span>
      </button>
    </div>
  )
}