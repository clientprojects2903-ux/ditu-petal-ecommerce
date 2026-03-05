"use client"

import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface CampaignData {
  campaign_id: number
  brand_id: string
  campaign_budget: number | null
  campaign_timeline_start: string | null
  campaign_timeline_end: string | null
  status: string | null
  admin_status: string
  created_at: string | null
}

interface QuarterData {
  name: string
  closed: number
  live: number
}

export function SpendBreakdownChart() {
  const [data, setData] = useState<QuarterData[]>([])
  const [totalClosedSpend, setTotalClosedSpend] = useState(0)
  const [totalLiveSpend, setTotalLiveSpend] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSpendData()
  }, [])

  const fetchSpendData = async () => {
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

      // Fetch all campaigns for the current brand/user
      const { data: campaigns, error: fetchError } = await supabase
        .from('campaigns')
        .select(`
          campaign_id,
          brand_id,
          campaign_budget,
          campaign_timeline_start,
          campaign_timeline_end,
          status,
          admin_status,
          created_at
        `)
        .eq('brand_id', user.id)

      if (fetchError) throw fetchError

      if (!campaigns || campaigns.length === 0) {
        setData([])
        setTotalClosedSpend(0)
        setTotalLiveSpend(0)
        setLoading(false)
        return
      }

      // Process campaign data
      const processedData = processCampaignData(campaigns)
      
      setData(processedData.quarterlyData)
      setTotalClosedSpend(processedData.totalClosed)
      setTotalLiveSpend(processedData.totalLive)

    } catch (err: any) {
      console.error('Error fetching spend data:', err)
      setError(err.message || 'Failed to fetch spend data')
    } finally {
      setLoading(false)
    }
  }

  const processCampaignData = (campaigns: CampaignData[]) => {
    // Initialize quarterly data for current year
    const currentYear = new Date().getFullYear()
    const quarters: QuarterData[] = [
      { name: `Q1 ${currentYear}`, closed: 0, live: 0 },
      { name: `Q2 ${currentYear}`, closed: 0, live: 0 },
      { name: `Q3 ${currentYear}`, closed: 0, live: 0 },
      { name: `Q4 ${currentYear}`, closed: 0, live: 0 },
    ]

    let totalClosed = 0
    let totalLive = 0

    campaigns.forEach(campaign => {
      const budget = campaign.campaign_budget || 0
      const status = campaign.status || campaign.admin_status
      const campaignDate = campaign.campaign_timeline_start || campaign.created_at

      // Determine if campaign is closed or live
      const isLive = status === 'active' || status === 'live'
      const isClosed = status === 'completed' || status === 'cancelled'

      if (isClosed) {
        totalClosed += budget
      } else if (isLive) {
        totalLive += budget
      }

      // Categorize by quarter if we have a date
      if (campaignDate && budget > 0) {
        const date = new Date(campaignDate)
        const year = date.getFullYear()
        const month = date.getMonth()
        
        // Only process current year data
        if (year === currentYear) {
          const quarterIndex = Math.floor(month / 3)
          
          if (quarterIndex >= 0 && quarterIndex < 4) {
            if (isClosed) {
              quarters[quarterIndex].closed += budget
            } else if (isLive) {
              quarters[quarterIndex].live += budget
            }
          }
        }
      }
    })

    return {
      quarterlyData: quarters,
      totalClosed,
      totalLive
    }
  }

  const formatCurrency = (amount: number) => {
    // Format for Indian Rupees
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'standard'
    }).format(amount)
  }

  const formatCompactCurrency = (amount: number) => {
    // For axis tick formatting - show compact format
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`
    }
    return `₹${amount}`
  }

  if (loading) {
    return (
      <div className="border border-[#e0d0e8] rounded-lg bg-white shadow-sm p-6">
        <div className="mb-6">
          <div className="h-6 bg-[#f0e6f5] rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-[#f0e6f5] rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="h-[280px] flex items-center justify-center">
          <div className="animate-pulse w-full h-full bg-[#f0e6f5] rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-[#e0d0e8] rounded-lg bg-white shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#4a2c4d]">Spend Breakdown</h3>
          <p className="text-sm text-[#6b4f73]">Closed vs Live campaign spending by quarter</p>
        </div>
        <div className="text-center py-8 border border-red-200 rounded-md bg-red-50">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchSpendData}
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
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#4a2c4d]">Spend Breakdown</h3>
              <p className="text-sm text-[#6b4f73]">Closed vs Live campaign spending by quarter</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#a58bb3]">Closed Projects Spend</p>
              <p className="text-xl font-bold text-[#4a2c4d]">{formatCurrency(totalClosedSpend)}</p>
            </div>
          </div>
        </div>
        
        {data.length === 0 || (totalClosedSpend === 0 && totalLiveSpend === 0) ? (
          <div className="h-[280px] flex flex-col items-center justify-center border border-[#e0d0e8] rounded-md bg-[#f8f5fa]">
            <p className="text-[#6b4f73] mb-2">No spend data available</p>
            <p className="text-sm text-[#a58bb3]">Create campaigns to see spending breakdown</p>
          </div>
        ) : (
          <>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0d0e8" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b4f73" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b4f73" }}
                    tickFormatter={(value) => formatCompactCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e0d0e8",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    labelFormatter={(label) => `Quarter: ${label}`}
                  />
                  <Bar 
                    dataKey="closed" 
                    fill="#14b8a6" 
                    radius={[4, 4, 0, 0]} 
                    name="Closed"
                    maxBarSize={40}
                  />
                  <Bar 
                    dataKey="live" 
                    fill="#87599a" 
                    radius={[4, 4, 0, 0]} 
                    name="Live"
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#14b8a6]" />
                <span className="text-sm text-[#6b4f73]">Closed</span>
                <span className="text-sm font-medium text-[#4a2c4d]">{formatCurrency(totalClosedSpend)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#87599a]" />
                <span className="text-sm text-[#6b4f73]">Live</span>
                <span className="text-sm font-medium text-[#4a2c4d]">{formatCurrency(totalLiveSpend)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}