export interface Influencer {
  id: string
  name: string
  avatar: string
  handle: string
  followers: number
  engagementRate: number
  niche: string
}

export interface Application {
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

export interface Campaign {
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

export const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer Fashion Collection Launch",
    brand: "StyleHub",
    budget: 50000,
    status: "active",
    startDate: "2025-06-01",
    endDate: "2025-07-31",
    description: "Promote our new summer collection across social media platforms",
    applicationsCount: 24,
    category: "Fashion",
  },
  {
    id: "2",
    name: "Fitness App Promotion",
    brand: "FitLife Pro",
    budget: 30000,
    status: "active",
    startDate: "2025-06-15",
    endDate: "2025-08-15",
    description: "Drive app downloads and user engagement for fitness tracking app",
    applicationsCount: 18,
    category: "Health & Fitness",
  },
  {
    id: "3",
    name: "Organic Skincare Launch",
    brand: "PureGlow",
    budget: 25000,
    status: "active",
    startDate: "2025-07-01",
    endDate: "2025-08-31",
    description: "Introduce new organic skincare line to eco-conscious consumers",
    applicationsCount: 32,
    category: "Beauty",
  },
  {
    id: "4",
    name: "Tech Gadget Review Series",
    brand: "TechNova",
    budget: 40000,
    status: "draft",
    startDate: "2025-08-01",
    endDate: "2025-09-30",
    description: "Create authentic review content for latest tech products",
    applicationsCount: 0,
    category: "Technology",
  },
  {
    id: "5",
    name: "Travel Destination Campaign",
    brand: "Wanderlust Adventures",
    budget: 60000,
    status: "completed",
    startDate: "2025-03-01",
    endDate: "2025-05-31",
    description: "Showcase exotic travel destinations and experiences",
    applicationsCount: 45,
    category: "Travel",
  },
]

export const applications: Application[] = [
  {
    id: "app-1",
    campaignId: "1",
    influencer: {
      id: "inf-1",
      name: "Sarah Mitchell",
      avatar: "/fashion-influencer-woman.png",
      handle: "@sarahstyles",
      followers: 850000,
      engagementRate: 4.2,
      niche: "Fashion & Lifestyle",
    },
    bidAmount: 8500,
    proposedDeliverables: "3 Instagram posts, 5 Stories, 1 Reel",
    estimatedReach: 425000,
    appliedAt: "2025-06-02",
    status: "pending",
    message: "I would love to collaborate on this campaign! My audience loves summer fashion content.",
  },
  {
    id: "app-2",
    campaignId: "1",
    influencer: {
      id: "inf-2",
      name: "Marcus Chen",
      avatar: "/male-fashion-influencer.jpg",
      handle: "@marcusfashion",
      followers: 620000,
      engagementRate: 5.1,
      niche: "Men's Fashion",
    },
    bidAmount: 6200,
    proposedDeliverables: "2 Instagram posts, 8 Stories, 2 Reels",
    estimatedReach: 310000,
    appliedAt: "2025-06-03",
    status: "pending",
    message: "Great opportunity! I specialize in men's fashion content with high engagement.",
  },
  {
    id: "app-3",
    campaignId: "1",
    influencer: {
      id: "inf-3",
      name: "Emily Rodriguez",
      avatar: "/lifestyle-blogger-woman.jpg",
      handle: "@emilylifestyle",
      followers: 1200000,
      engagementRate: 3.8,
      niche: "Lifestyle & Travel",
    },
    bidAmount: 12000,
    proposedDeliverables: "4 Instagram posts, 10 Stories, 3 Reels, 1 YouTube video",
    estimatedReach: 720000,
    appliedAt: "2025-06-01",
    status: "approved",
    message: "My audience is highly engaged with fashion content. Let's create something amazing!",
  },
  {
    id: "app-4",
    campaignId: "1",
    influencer: {
      id: "inf-4",
      name: "Jordan Blake",
      avatar: "/young-fashion-influencer.jpg",
      handle: "@jordanblake",
      followers: 450000,
      engagementRate: 6.5,
      niche: "Streetwear & Urban Fashion",
    },
    bidAmount: 4500,
    proposedDeliverables: "2 Instagram posts, 4 Stories, 1 TikTok",
    estimatedReach: 225000,
    appliedAt: "2025-06-04",
    status: "pending",
    message: "Streetwear expert here! I can bring a fresh perspective to your summer collection.",
  },
  {
    id: "app-5",
    campaignId: "2",
    influencer: {
      id: "inf-5",
      name: "Alex Thompson",
      avatar: "/fitness-influencer-male.jpg",
      handle: "@alexfitness",
      followers: 980000,
      engagementRate: 5.8,
      niche: "Fitness & Health",
    },
    bidAmount: 9800,
    proposedDeliverables: "3 Instagram posts, 6 Stories, 2 Reels, App demo video",
    estimatedReach: 490000,
    appliedAt: "2025-06-16",
    status: "pending",
    message: "Perfect fit for my audience! I've been looking for a quality fitness app to recommend.",
  },
  {
    id: "app-6",
    campaignId: "2",
    influencer: {
      id: "inf-6",
      name: "Nina Patel",
      avatar: "/yoga-instructor-woman.png",
      handle: "@ninayoga",
      followers: 520000,
      engagementRate: 7.2,
      niche: "Yoga & Wellness",
    },
    bidAmount: 5200,
    proposedDeliverables: "2 Instagram posts, 5 Stories, 1 Reel",
    estimatedReach: 260000,
    appliedAt: "2025-06-17",
    status: "pending",
    message: "My yoga community would love to discover this app. High wellness engagement!",
  },
  {
    id: "app-7",
    campaignId: "3",
    influencer: {
      id: "inf-7",
      name: "Olivia Green",
      avatar: "/beauty-influencer-sustainable.jpg",
      handle: "@oliviabeauty",
      followers: 780000,
      engagementRate: 4.9,
      niche: "Clean Beauty",
    },
    bidAmount: 7800,
    proposedDeliverables: "3 Instagram posts, 8 Stories, 2 Reels, Skincare routine video",
    estimatedReach: 390000,
    appliedAt: "2025-07-02",
    status: "pending",
    message: "Organic skincare is my passion! I only promote products I truly believe in.",
  },
]

export function getCampaignById(id: string): Campaign | undefined {
  return campaigns.find((c) => c.id === id)
}

export function getApplicationsByCampaignId(campaignId: string): Application[] {
  return applications.filter((a) => a.campaignId === campaignId)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + "K"
  }
  return num.toString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}
