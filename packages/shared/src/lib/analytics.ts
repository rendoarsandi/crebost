export interface AnalyticsEvent {
  userId: string
  campaignId?: string
  promotionId?: string
  event: string
  metadata?: Record<string, any>
  timestamp?: Date
  ipAddress?: string
  userAgent?: string
  referrer?: string
}

export interface ViewTrackingData {
  contentUrl: string
  platform: string
  promotionId: string
  campaignId: string
  promoterId: string
  timestamp: Date
  viewerData?: {
    ipAddress?: string
    userAgent?: string
    referrer?: string
    location?: {
      country?: string
      city?: string
    }
  }
}

export interface EngagementMetrics {
  views: number
  likes: number
  comments: number
  shares: number
  clickThroughs: number
  engagementRate: number
  reach: number
  impressions: number
}

export interface CampaignAnalytics {
  campaignId: string
  totalViews: number
  totalReach: number
  totalEngagement: number
  averageEngagementRate: number
  topPerformingPromotions: {
    promotionId: string
    views: number
    engagementRate: number
  }[]
  platformBreakdown: {
    platform: string
    views: number
    engagement: number
  }[]
  demographicBreakdown: {
    ageGroup: string
    gender: string
    location: string
    percentage: number
  }[]
  timeSeriesData: {
    date: string
    views: number
    engagement: number
  }[]
}

export interface PromoterAnalytics {
  promoterId: string
  totalPromotions: number
  totalViews: number
  totalEarnings: number
  averageEngagementRate: number
  topCampaigns: {
    campaignId: string
    campaignTitle: string
    views: number
    earnings: number
  }[]
  platformPerformance: {
    platform: string
    promotions: number
    averageViews: number
    averageEngagement: number
  }[]
  monthlyStats: {
    month: string
    promotions: number
    views: number
    earnings: number
  }[]
}

// Analytics event types
export const ANALYTICS_EVENTS = {
  // User events
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  USER_PROFILE_UPDATED: 'user_profile_updated',
  
  // Campaign events
  CAMPAIGN_CREATED: 'campaign_created',
  CAMPAIGN_PUBLISHED: 'campaign_published',
  CAMPAIGN_PAUSED: 'campaign_paused',
  CAMPAIGN_COMPLETED: 'campaign_completed',
  CAMPAIGN_VIEWED: 'campaign_viewed',
  CAMPAIGN_APPLIED: 'campaign_applied',
  
  // Promotion events
  PROMOTION_SUBMITTED: 'promotion_submitted',
  PROMOTION_APPROVED: 'promotion_approved',
  PROMOTION_REJECTED: 'promotion_rejected',
  PROMOTION_VIEWED: 'promotion_viewed',
  PROMOTION_CLICKED: 'promotion_clicked',
  PROMOTION_SHARED: 'promotion_shared',
  PROMOTION_LIKED: 'promotion_liked',
  PROMOTION_COMMENTED: 'promotion_commented',
  
  // Payment events
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  WITHDRAWAL_REQUESTED: 'withdrawal_requested',
  WITHDRAWAL_COMPLETED: 'withdrawal_completed',
  
  // Content events
  CONTENT_VIEW: 'content_view',
  CONTENT_CLICK: 'content_click',
  CONTENT_SHARE: 'content_share',
  CONTENT_LIKE: 'content_like',
  CONTENT_COMMENT: 'content_comment',
  
  // Platform events
  PLATFORM_ERROR: 'platform_error',
  PLATFORM_FEATURE_USED: 'platform_feature_used',
} as const

export type AnalyticsEventType = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]

// Social media platform APIs for fetching metrics
export interface PlatformMetrics {
  platform: string
  contentId: string
  views: number
  likes: number
  comments: number
  shares: number
  reach?: number
  impressions?: number
  engagementRate: number
  lastUpdated: Date
}

export class AnalyticsTracker {
  private apiEndpoint: string
  private apiKey?: string

  constructor(apiEndpoint: string, apiKey?: string) {
    this.apiEndpoint = apiEndpoint
    this.apiKey = apiKey
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const response = await fetch(`${this.apiEndpoint}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          ...event,
          timestamp: event.timestamp || new Date(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Analytics tracking failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error)
      // Don't throw error to avoid breaking the main flow
    }
  }

  async trackView(data: ViewTrackingData): Promise<void> {
    await this.trackEvent({
      userId: data.promoterId,
      campaignId: data.campaignId,
      promotionId: data.promotionId,
      event: ANALYTICS_EVENTS.CONTENT_VIEW,
      metadata: {
        platform: data.platform,
        contentUrl: data.contentUrl,
        viewerData: data.viewerData,
      },
      timestamp: data.timestamp,
    })
  }

  async trackEngagement(
    promotionId: string,
    campaignId: string,
    promoterId: string,
    engagementType: 'like' | 'comment' | 'share' | 'click',
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventMap = {
      like: ANALYTICS_EVENTS.CONTENT_LIKE,
      comment: ANALYTICS_EVENTS.CONTENT_COMMENT,
      share: ANALYTICS_EVENTS.CONTENT_SHARE,
      click: ANALYTICS_EVENTS.CONTENT_CLICK,
    }

    await this.trackEvent({
      userId: promoterId,
      campaignId,
      promotionId,
      event: eventMap[engagementType],
      metadata,
    })
  }
}

// Utility functions for analytics calculations
export function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  views: number
): number {
  if (views === 0) return 0
  const totalEngagement = likes + comments + shares
  return (totalEngagement / views) * 100
}

export function calculateReach(views: number, impressions: number): number {
  // Reach is typically lower than impressions
  // This is a simplified calculation
  return Math.min(views, Math.round(impressions * 0.7))
}

export function aggregateMetrics(metrics: PlatformMetrics[]): EngagementMetrics {
  const totals = metrics.reduce(
    (acc, metric) => ({
      views: acc.views + metric.views,
      likes: acc.likes + metric.likes,
      comments: acc.comments + metric.comments,
      shares: acc.shares + metric.shares,
      reach: acc.reach + (metric.reach || 0),
      impressions: acc.impressions + (metric.impressions || 0),
    }),
    { views: 0, likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0 }
  )

  return {
    ...totals,
    clickThroughs: 0, // This would come from our own tracking
    engagementRate: calculateEngagementRate(
      totals.likes,
      totals.comments,
      totals.shares,
      totals.views
    ),
  }
}

export function formatAnalyticsNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function getAnalyticsDateRange(period: 'day' | 'week' | 'month' | 'year'): {
  startDate: Date
  endDate: Date
} {
  const endDate = new Date()
  const startDate = new Date()

  switch (period) {
    case 'day':
      startDate.setDate(endDate.getDate() - 1)
      break
    case 'week':
      startDate.setDate(endDate.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1)
      break
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
  }

  return { startDate, endDate }
}

// Platform-specific metric fetchers (these would integrate with actual APIs)
export class PlatformMetricsFetcher {
  async fetchTikTokMetrics(videoId: string): Promise<PlatformMetrics | null> {
    // This would integrate with TikTok's API
    // For now, return mock data
    return {
      platform: 'TIKTOK',
      contentId: videoId,
      views: Math.floor(Math.random() * 100000),
      likes: Math.floor(Math.random() * 10000),
      comments: Math.floor(Math.random() * 1000),
      shares: Math.floor(Math.random() * 500),
      reach: Math.floor(Math.random() * 80000),
      impressions: Math.floor(Math.random() * 120000),
      engagementRate: Math.random() * 10,
      lastUpdated: new Date(),
    }
  }

  async fetchInstagramMetrics(postId: string): Promise<PlatformMetrics | null> {
    // This would integrate with Instagram's API
    return {
      platform: 'INSTAGRAM',
      contentId: postId,
      views: Math.floor(Math.random() * 50000),
      likes: Math.floor(Math.random() * 5000),
      comments: Math.floor(Math.random() * 500),
      shares: Math.floor(Math.random() * 200),
      reach: Math.floor(Math.random() * 40000),
      impressions: Math.floor(Math.random() * 60000),
      engagementRate: Math.random() * 8,
      lastUpdated: new Date(),
    }
  }

  async fetchYouTubeMetrics(videoId: string): Promise<PlatformMetrics | null> {
    // This would integrate with YouTube's API
    return {
      platform: 'YOUTUBE',
      contentId: videoId,
      views: Math.floor(Math.random() * 200000),
      likes: Math.floor(Math.random() * 15000),
      comments: Math.floor(Math.random() * 2000),
      shares: Math.floor(Math.random() * 1000),
      reach: Math.floor(Math.random() * 150000),
      impressions: Math.floor(Math.random() * 250000),
      engagementRate: Math.random() * 12,
      lastUpdated: new Date(),
    }
  }

  async fetchMetricsForPromotion(
    platform: string,
    contentId: string
  ): Promise<PlatformMetrics | null> {
    switch (platform.toUpperCase()) {
      case 'TIKTOK':
        return this.fetchTikTokMetrics(contentId)
      case 'INSTAGRAM':
        return this.fetchInstagramMetrics(contentId)
      case 'YOUTUBE':
        return this.fetchYouTubeMetrics(contentId)
      default:
        return null
    }
  }
}
