"use client"

import { Clock, CheckCircle, XCircle, FileText, TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface StatCard {
  label: string
  value: string
  icon: any
  trend: {
    text: string
    type: 'positive' | 'negative' | 'neutral'
    change?: number
  }
  highlight?: boolean
}

interface StatsData {
  total: number
  pending: number
  approved: number
  rejected: number
  urgentPending: number
  todayStats: {
    approved: number
    rejected: number
    total: number
  }
  weeklyStats: {
    total: number
    change: number
    changePercentage: number
  }
  monthlyStats: {
    approved: number
    rejected: number
    pending: number
  }
}

export function StatsCards() {
  const [stats, setStats] = useState<StatCard[]>([
    { 
      label: "Total Campaigns", 
      value: "0", 
      icon: FileText, 
      trend: { text: "Loading...", type: 'neutral' } 
    },
    { 
      label: "Pending Review", 
      value: "0", 
      icon: Clock, 
      trend: { text: "Loading...", type: 'neutral' },
      highlight: true 
    },
    { 
      label: "Approved", 
      value: "0", 
      icon: CheckCircle, 
      trend: { text: "Loading...", type: 'neutral' } 
    },
    { 
      label: "Rejected", 
      value: "0", 
      icon: XCircle, 
      trend: { text: "Loading...", type: 'neutral' } 
    },
  ])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    fetchStats()
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      const now = new Date()
      
      // Calculate date ranges
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)
      
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const startOfWeek = new Date(today)
      const day = today.getDay()
      const diff = today.getDate() - day + (day === 0 ? -6 : 1)
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      
      // Use Supabase queries with count for better performance
      const [
        { count: total, error: totalError },
        { count: pending, error: pendingError },
        { count: approved, error: approvedError },
        { count: rejected, error: rejectedError },
        { count: todayApproved, error: todayApprovedError },
        { count: todayRejected, error: todayRejectedError },
        { count: weekTotal, error: weekError },
        { count: prevWeekTotal, error: prevWeekError },
      ] = await Promise.all([
        supabase.from('campaigns').select('*', { count: 'exact', head: true }),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('admin_status', 'pending'),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('admin_status', 'approved'),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('admin_status', 'rejected'),
        supabase.from('campaigns').select('*', { count: 'exact', head: true })
          .eq('admin_status', 'approved')
          .gte('updated_at', today.toISOString()),
        supabase.from('campaigns').select('*', { count: 'exact', head: true })
          .eq('admin_status', 'rejected')
          .gte('updated_at', today.toISOString()),
        supabase.from('campaigns').select('*', { count: 'exact', head: true })
          .gte('created_at', startOfWeek.toISOString()),
        supabase.from('campaigns').select('*', { count: 'exact', head: true })
          .gte('created_at', startOfPreviousMonth.toISOString())
          .lt('created_at', startOfWeek.toISOString()),
      ])

      // Check for errors
      const errors = [
        totalError, pendingError, approvedError, rejectedError,
        todayApprovedError, todayRejectedError, weekError, prevWeekError
      ].filter(Boolean)
      
      if (errors.length > 0) throw errors[0]

      // Get urgent pending campaigns (more than 3 days old)
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      
      const { count: urgentPending, error: urgentError } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('admin_status', 'pending')
        .lt('created_at', threeDaysAgo.toISOString())
      
      if (urgentError) throw urgentError

      // Calculate weekly change
      const weeklyChange = (weekTotal || 0) - (prevWeekTotal || 0)
      const weeklyChangePercentage = prevWeekTotal 
        ? ((weeklyChange / prevWeekTotal) * 100).toFixed(1)
        : 0

      // Update stats
      const updatedStats: StatCard[] = [
        {
          label: "Total Campaigns",
          value: (total || 0).toLocaleString(),
          icon: FileText,
          trend: {
            text: weeklyChange > 0 
              ? `+${weeklyChange} this week (${weeklyChangePercentage}%)`
              : weeklyChange < 0 
                ? `${weeklyChange} this week (${Math.abs(Number(weeklyChangePercentage))}%)`
                : "No change this week",
            type: weeklyChange > 0 ? 'positive' : weeklyChange < 0 ? 'negative' : 'neutral',
            change: weeklyChange
          },
        },
        {
          label: "Pending Review",
          value: (pending || 0).toLocaleString(),
          icon: Clock,
          trend: {
            text: (urgentPending || 0) > 0 
              ? `${urgentPending} urgent review${urgentPending === 1 ? '' : 's'} needed`
              : "All up to date",
            type: (urgentPending || 0) > 0 ? 'negative' : 'positive'
          },
          highlight: (urgentPending || 0) > 0,
        },
        {
          label: "Approved",
          value: (approved || 0).toLocaleString(),
          icon: CheckCircle,
          trend: {
            text: (todayApproved || 0) > 0 
              ? `+${todayApproved} today`
              : "No approvals today",
            type: (todayApproved || 0) > 0 ? 'positive' : 'neutral',
            change: todayApproved || 0
          },
        },
        {
          label: "Rejected",
          value: (rejected || 0).toLocaleString(),
          icon: XCircle,
          trend: {
            text: (todayRejected || 0) > 0 
              ? `${todayRejected} today`
              : "No rejections today",
            type: (todayRejected || 0) > 0 ? 'negative' : 'neutral',
            change: todayRejected || 0
          },
        },
      ]

      setStats(updatedStats)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats([
        { 
          label: "Total Campaigns", 
          value: "0", 
          icon: FileText, 
          trend: { text: "Error loading", type: 'negative' } 
        },
        { 
          label: "Pending Review", 
          value: "0", 
          icon: Clock, 
          trend: { text: "Error loading", type: 'negative' },
          highlight: true 
        },
        { 
          label: "Approved", 
          value: "0", 
          icon: CheckCircle, 
          trend: { text: "Error loading", type: 'negative' } 
        },
        { 
          label: "Rejected", 
          value: "0", 
          icon: XCircle, 
          trend: { text: "Error loading", type: 'negative' } 
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Real-time subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('campaigns-realtime-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns'
        },
        (payload) => {
          // Debounce updates to prevent too many refreshes
          setTimeout(fetchStats, 1000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getTrendIcon = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-300 rounded-lg shadow-sm animate-pulse">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-28"></div>
                </div>
                <div className="ml-4 p-3 rounded-lg bg-gray-100">
                  <div className="h-6 w-6"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-semibold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(stat.trend.type)}
                    <p className={`text-xs ${stat.highlight ? 'text-yellow-600' : stat.trend.type === 'positive' ? 'text-green-600' : stat.trend.type === 'negative' ? 'text-red-600' : 'text-gray-500'}`}>
                      {stat.trend.text}
                    </p>
                  </div>
                </div>
                <div className={`ml-4 p-3 rounded-lg ${stat.highlight ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  <stat.icon className={`h-6 w-6 ${stat.highlight ? 'text-yellow-600' : stat.trend.type === 'positive' ? 'text-green-500' : stat.trend.type === 'negative' ? 'text-red-500' : 'text-gray-500'}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {lastUpdated && (
        <div className="text-xs text-gray-500 text-right mb-4">
          Last updated: {lastUpdated}
        </div>
      )}
    </>
  )
}