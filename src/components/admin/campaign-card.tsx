import Link from "next/link"

// Types from your data.ts
interface Campaign {
  id: string
  name: string
  brand: string
  budget: number
  status: "active" | "draft" | "completed" | "paused"
  startDate: string
  endDate: string
  description: string
  applicationsCount: number
  category: string
}

interface CampaignCardProps {
  campaign: Campaign
}

// Icon components
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)

const DollarSignIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
)

export function CampaignCard({ campaign }: CampaignCardProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const statusColors = {
    active: "bg-green-100 text-green-800",
    draft: "bg-gray-100 text-gray-800",
    completed: "bg-blue-100 text-blue-800",
    paused: "bg-yellow-100 text-yellow-800",
  }

  const statusText = {
    active: "Active",
    draft: "Draft",
    completed: "Completed",
    paused: "Paused",
  }

  return (
    <div className="group bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-blue-300">
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {campaign.name}
            </h3>
            <p className="text-sm text-gray-500">{campaign.brand}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[campaign.status]}`}>
            {statusText[campaign.status]}
          </span>
        </div>
      </div>
      <div className="px-4 pb-4 space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
        <div className="flex items-center gap-2">
          <div className="text-gray-400">
            <TagIcon />
          </div>
          <span className="text-xs text-gray-500">{campaign.category}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <div className="text-blue-600">
                <DollarSignIcon />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="text-sm font-medium text-gray-900">{formatCurrency(campaign.budget)}</p>
            </div>
          </div>
          
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <CalendarIcon />
          <span>
            {new Date(campaign.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
            {new Date(campaign.endDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
      <div className="px-4 pt-0 pb-4">
        <Link href={`/dashboard/admin/campaign/${campaign.id}`} className="w-full block">
          <button className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            View Applications
            <ArrowRightIcon />
          </button>
        </Link>
      </div>
    </div>
  )
}