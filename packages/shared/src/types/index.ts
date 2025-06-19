// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Campaign related types
export interface CampaignRequirement {
  platform: string
  minFollowers?: number
  minEngagementRate?: number
  contentType: string[]
  hashtags?: string[]
  mentions?: string[]
  description: string
}

export interface CampaignMaterial {
  type: 'image' | 'video' | 'text' | 'link'
  url?: string
  content?: string
  description: string
}

export interface SocialMediaMetrics {
  views: number
  likes: number
  comments: number
  shares: number
  saves?: number
  engagementRate: number
}

export interface PromotionProof {
  contentUrl: string
  screenshotUrl?: string
  metrics: SocialMediaMetrics
  timestamp: string
}

// Payment related types
export interface PaymentData {
  method: 'bank_transfer' | 'e_wallet' | 'credit_card'
  provider: string
  transactionId: string
  amount: number
  currency: string
  status: string
  processedAt: string
}

export interface WithdrawalBankInfo {
  bankName: string
  accountNumber: string
  accountName: string
}

// Analytics types
export interface CampaignMetrics {
  totalViews: number
  totalEngagement: number
  totalSpent: number
  averageCPV: number // Cost per view
  platformBreakdown: Record<string, {
    views: number
    engagement: number
    spent: number
  }>
}

export interface UserStats {
  totalCampaigns: number
  totalPromotions: number
  totalEarnings: number
  averageRating: number
  completionRate: number
}

// Form types
export interface CreateCampaignForm {
  title: string
  description: string
  budgetUsd: number
  ratePerViewerUsd: number
  targetViewers: number
  requirements: CampaignRequirement[]
  materials: CampaignMaterial[]
  startDate: string
  endDate: string
}

export interface CreatePromotionForm {
  campaignId: string
  platform: string
  contentUrl: string
  estimatedReach: number
}

export interface WithdrawalRequestForm {
  amount: number
  bankInfo: WithdrawalBankInfo
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

// Filter and search types
export interface CampaignFilters {
  status?: string[]
  platform?: string[]
  minBudget?: number
  maxBudget?: number
  minRate?: number
  maxRate?: number
  createdAfter?: string
  createdBefore?: string
}

export interface PromotionFilters {
  status?: string[]
  platform?: string[]
  campaignId?: string
  submittedAfter?: string
  submittedBefore?: string
}

export interface SearchParams {
  query?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
