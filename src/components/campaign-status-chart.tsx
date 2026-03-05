"use client"

import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

// Updated interface with percent property
interface StatusData {
  name: string
  value: number
  color: string
  percent?: number  // Add this
  [key: string]: any
}

interface Campaign {
  status: string | null
  admin_status: string
}

const statusColors: Record<string, string> = {
  'active': '#87599a',      // Live - Primary Purple
  'live': '#87599a',        // Live - Primary Purple
  'paused': '#eab308',      // Paused - Yellow
  'scheduled': '#3b82f6',   // Scheduled - Blue
  'completed': '#14b8a6',   // Completed - Teal
  'cancelled': '#ef4444',   // Cancelled - Red
  'pending': '#a58bb3',     // Draft/Pending - Light Purple
  'draft': '#a58bb3',       // Draft - Light Purple
}

const statusDisplayNames: Record<string, string> = {
  'active': 'Live',
  'live': 'Live',
  'paused': 'Paused',
  'scheduled': 'Scheduled',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'pending': 'Draft',
  'draft': 'Draft',
}

export function CampaignStatusChart() {
  const [statusData, setStatusData] = useState<StatusData[]>([])
  const [totalCampaigns, setTotalCampaigns] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaignStatusData()
  }, [])

  const fetchCampaignStatusData = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) {
        setError("No user logged in")
        setLoading(false)
        return
      }

      // Fetch campaign status counts for the current brand/user
      const { data: campaigns, error: fetchError } = await supabase
        .from('campaigns')
        .select('status, admin_status')
        .eq('brand_id', user.id)

      if (fetchError) throw fetchError

      // Process the data to count campaigns by status
      const processedData = processCampaignStatus(campaigns || [])
      
      setStatusData(processedData.statusCounts)
      setTotalCampaigns(processedData.totalCampaigns)

    } catch (err: any) {
      console.error('Error fetching campaign status data:', err)
      setError(err.message || 'Failed to fetch campaign status data')
    } finally {
      setLoading(false)
    }
  }

  const processCampaignStatus = (campaigns: Campaign[]) => {
    // Initialize counts for all possible statuses
    const statusCounts: Record<string, number> = {
      'Live': 0,
      'Paused': 0,
      'Scheduled': 0,
      'Completed': 0,
      'Cancelled': 0,
      'Draft': 0,
    }

    let totalCampaigns = 0

    campaigns.forEach(campaign => {
      // Determine the effective status (prefer status over admin_status)
      const effectiveStatus = (campaign.status || campaign.admin_status || 'pending').toLowerCase()
      
      // Map to display status
      const displayStatus = statusDisplayNames[effectiveStatus] || 
                           effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1)
      
      // Use 'Draft' as fallback for unknown statuses
      const finalStatus = statusDisplayNames[effectiveStatus] ? displayStatus : 'Draft'
      
      statusCounts[finalStatus] = (statusCounts[finalStatus] || 0) + 1
      totalCampaigns++
    })

    // Convert to array format for the chart
    const chartData: StatusData[] = Object.entries(statusCounts)
      .filter(([_, count]) => count > 0) // Only include statuses with campaigns
      .map(([status, count]) => ({
        name: status,
        value: count,
        color: statusColors[status.toLowerCase()] || '#a58bb3'
      }))
      .sort((a, b) => b.value - a.value) // Sort by count descending

    return {
      statusCounts: chartData,
      totalCampaigns
    }
  }

  // Format tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = totalCampaigns > 0 
        ? ((data.value / totalCampaigns) * 100).toFixed(1)
        : '0'
      
      return (
        <div className="bg-white p-3 border border-[#e0d0e8] rounded-lg shadow-sm">
          <p className="font-medium text-[#4a2c4d]">{data.name}</p>
          <p className="text-sm text-[#6b4f73]">
            {data.value} campaign{data.value !== 1 ? 's' : ''}
          </p>
          <p className="text-sm text-[#a58bb3]">
            {percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="border border-[#e0d0e8] rounded-lg bg-white shadow-sm p-6">
        <div className="mb-4">
          <div className="h-6 bg-[#f0e6f5] rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-[#f0e6f5] rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="h-[280px] flex items-center justify-center">
          <div className="animate-pulse w-48 h-48 rounded-full bg-[#f0e6f5]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-[#e0d0e8] rounded-lg bg-white shadow-sm p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#4a2c4d]">Campaign Status</h3>
          <p className="text-sm text-[#6b4f73]">Distribution of all campaigns by status</p>
        </div>
        <div className="h-[280px] flex flex-col items-center justify-center border border-red-200 rounded-md bg-red-50">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchCampaignStatusData}
            className="px-4 py-2 bg-[#87599a] text-white rounded-md hover:bg-[#764887] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-[#e0d0e8] rounded-lg bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#4a2c4d]">Campaign Status</h3>
              <p className="text-sm text-[#6b4f73]">
                {totalCampaigns} campaign{totalCampaigns !== 1 ? 's' : ''} total
              </p>
            </div>
            <button
              onClick={fetchCampaignStatusData}
              className="text-sm text-[#87599a] hover:text-[#764887] font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
        
        {statusData.length === 0 ? (
          <div className="h-[280px] flex flex-col items-center justify-center border border-[#e0d0e8] rounded-md bg-[#f8f5fa]">
            <p className="text-[#6b4f73] mb-2">No campaign data available</p>
            <p className="text-sm text-[#a58bb3]">Create campaigns to see status distribution</p>
          </div>
        ) : (
          <>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={statusData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={100} 
                    paddingAngle={2} 
                    dataKey="value"
                    label={({ name, percent }) => 
  `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`
}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-[#4a2c4d] font-medium">
                        {value}
                      </span>
                    )}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              {statusData.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-sm text-[#6b4f73]">{item.name}</span>
                  <span className="text-sm font-medium text-[#4a2c4d] ml-auto">
                    {item.value}
                  </span>
                  {totalCampaigns > 0 && (
                    <span className="text-xs text-[#a58bb3]">
                      ({((item.value / totalCampaigns) * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {statusData.length > 4 && (
              <div className="mt-3 pt-3 border-t border-[#e0d0e8]">
                <div className="grid grid-cols-2 gap-3">
                  {statusData.slice(4).map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <span className="text-sm text-[#6b4f73]">{item.name}</span>
                      <span className="text-sm font-medium text-[#4a2c4d] ml-auto">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}