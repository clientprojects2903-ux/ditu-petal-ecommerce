"use client"

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

interface ComparePanelProps {
  applications: Application[]
  campaignBudget: number
  onClose: () => void
  onApprove: (id: string) => void
}

// Icon components
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
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

export function ComparePanel({ applications, campaignBudget, onClose, onApprove }: ComparePanelProps) {
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

  const lowestBidApp = applications.reduce((min, app) => (app.bidAmount < min.bidAmount ? app : min), applications[0])
  const highestEngagementApp = applications.reduce(
    (max, app) => (app.influencer.engagementRate > max.influencer.engagementRate ? app : max),
    applications[0],
  )
  const highestReachApp = applications.reduce(
    (max, app) => (app.estimatedReach > max.estimatedReach ? app : max),
    applications[0],
  )
  const mostFollowersApp = applications.reduce(
    (max, app) => (app.influencer.followers > max.influencer.followers ? app : max),
    applications[0],
  )

  const metrics = [
    {
      label: "Bid Amount",
      key: "bidAmount",
      icon: DollarSignIcon,
      best: lowestBidApp.id,
      format: formatCurrency,
      lower: true,
    },
    { 
      label: "Followers", 
      key: "followers", 
      icon: UsersIcon, 
      best: mostFollowersApp.id, 
      format: formatNumber 
    },
    {
      label: "Engagement Rate",
      key: "engagement",
      icon: TrendingUpIcon,
      best: highestEngagementApp.id,
      format: (v: number) => `${v}%`,
    },
    { 
      label: "Est. Reach", 
      key: "reach", 
      icon: TargetIcon, 
      best: highestReachApp.id, 
      format: formatNumber 
    },
  ]

  const getValue = (app: Application, key: string) => {
    switch (key) {
      case "bidAmount":
        return app.bidAmount
      case "followers":
        return app.influencer.followers
      case "engagement":
        return app.influencer.engagementRate
      case "reach":
        return app.estimatedReach
      default:
        return 0
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm sm:items-center p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Compare Applications</h2>
            <p className="text-sm text-gray-500">Side-by-side comparison of selected influencers</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <XIcon />
          </button>
        </div>

        <div className="p-6">
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(${applications.length}, minmax(200px, 1fr))` }}
          >
            {applications.map((app) => (
              <div key={app.id} className="text-center">
                <div className="relative inline-block">
                  <div className="h-20 w-20 rounded-full border-4 border-gray-200 overflow-hidden mx-auto">
                    <img
                      src={app.influencer.avatar || "/placeholder.svg"}
                      alt={app.influencer.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-600 text-lg font-medium">
                      {app.influencer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  </div>
                  {app.id === lowestBidApp.id && app.id === highestEngagementApp.id && (
                    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                      <TrophyIcon />
                    </div>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{app.influencer.name}</h3>
                <p className="text-sm text-gray-500">{app.influencer.handle}</p>
                <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700 mt-2">
                  {app.influencer.niche}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            {metrics.map((metric) => (
              <div
                key={metric.key}
                className="grid items-center gap-6 rounded-lg bg-gray-50 p-4"
                style={{ gridTemplateColumns: `140px repeat(${applications.length}, minmax(100px, 1fr))` }}
              >
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <metric.icon />
                  {metric.label}
                </div>
                {applications.map((app) => {
                  const value = getValue(app, metric.key)
                  const isBest = app.id === metric.best
                  return (
                    <div
                      key={app.id}
                      className={`text-center rounded-lg py-2 ${isBest ? "bg-green-100 text-green-800 font-semibold" : "text-gray-900"}`}
                    >
                      {metric.format(value)}
                      {isBest && <span className="ml-1 text-[10px] text-green-600">Best</span>}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Proposed Deliverables</h4>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${applications.length}, minmax(200px, 1fr))` }}
            >
              {applications.map((app) => (
                <div key={app.id} className="text-sm text-gray-900 rounded-lg bg-gray-50 p-3">
                  {app.proposedDeliverables}
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-6 grid gap-4"
            style={{ gridTemplateColumns: `repeat(${applications.length}, minmax(200px, 1fr))` }}
          >
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  onApprove(app.id)
                  onClose()
                }}
                disabled={app.status !== "pending"}
                className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  app.status === "pending"
                    ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                    : app.status === "approved"
                    ? "bg-green-100 text-green-800 cursor-not-allowed"
                    : "bg-red-100 text-red-800 cursor-not-allowed"
                }`}
              >
                {app.status === "pending" && <CheckIcon />}
                {app.status === "pending" ? "Approve" : app.status === "approved" ? "Approved" : "Rejected"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}