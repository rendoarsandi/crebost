import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '@crebost/database'
import { getAnalyticsDateRange } from '@crebost/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { campaignId } = req.query
    const { period = 'month' } = req.query

    if (!campaignId || typeof campaignId !== 'string') {
      return res.status(400).json({ error: 'Campaign ID is required' })
    }

    // Get campaign and verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        title: true,
        creatorId: true,
        status: true,
        budgetIdr: true,
        targetViewers: true,
        totalViews: true,
        totalClicks: true,
        startDate: true,
        endDate: true,
      },
    })

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    if (campaign.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Get date range for analytics
    const { startDate, endDate } = getAnalyticsDateRange(period as any)

    // Get promotions for this campaign
    const promotions = await prisma.promotion.findMany({
      where: { campaignId },
      select: {
        id: true,
        platform: true,
        contentUrl: true,
        viewsCount: true,
        clicksCount: true,
        likesCount: true,
        commentsCount: true,
        sharesCount: true,
        status: true,
        submittedAt: true,
        promoter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Get analytics events for this campaign
    const analyticsEvents = await prisma.analytics.findMany({
      where: {
        campaignId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        event: true,
        metadata: true,
        createdAt: true,
        promotionId: true,
      },
    })

    // Get view tracking data
    const viewTracking = await prisma.viewTracking.findMany({
      where: {
        campaignId,
        viewedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        promotionId: true,
        platform: true,
        viewedAt: true,
        ipAddress: true,
      },
    })

    // Calculate metrics
    const totalPromotions = promotions.length
    const activePromotions = promotions.filter(p => p.status === 'APPROVED' || p.status === 'COMPLETED').length
    const totalViews = promotions.reduce((sum, p) => sum + (p.viewsCount || 0), 0)
    const totalClicks = promotions.reduce((sum, p) => sum + (p.clicksCount || 0), 0)
    const totalLikes = promotions.reduce((sum, p) => sum + (p.likesCount || 0), 0)
    const totalComments = promotions.reduce((sum, p) => sum + (p.commentsCount || 0), 0)
    const totalShares = promotions.reduce((sum, p) => sum + (p.sharesCount || 0), 0)
    const totalEngagement = totalLikes + totalComments + totalShares
    const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0
    const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0

    // Platform breakdown
    const platformBreakdown = promotions.reduce((acc, promotion) => {
      const platform = promotion.platform
      if (!acc[platform]) {
        acc[platform] = {
          platform,
          promotions: 0,
          views: 0,
          clicks: 0,
          engagement: 0,
        }
      }
      acc[platform].promotions += 1
      acc[platform].views += promotion.viewsCount || 0
      acc[platform].clicks += promotion.clicksCount || 0
      acc[platform].engagement += (promotion.likesCount || 0) + (promotion.commentsCount || 0) + (promotion.sharesCount || 0)
      return acc
    }, {} as Record<string, any>)

    // Top performing promotions
    const topPerformingPromotions = promotions
      .map(promotion => ({
        promotionId: promotion.id,
        promoterName: promotion.promoter.name,
        platform: promotion.platform,
        views: promotion.viewsCount || 0,
        clicks: promotion.clicksCount || 0,
        engagement: (promotion.likesCount || 0) + (promotion.commentsCount || 0) + (promotion.sharesCount || 0),
        engagementRate: promotion.viewsCount > 0 
          ? (((promotion.likesCount || 0) + (promotion.commentsCount || 0) + (promotion.sharesCount || 0)) / promotion.viewsCount) * 100 
          : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Time series data (daily breakdown)
    const timeSeriesData = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      const dayViews = viewTracking.filter(v => 
        v.viewedAt >= dayStart && v.viewedAt <= dayEnd
      ).length

      const dayEvents = analyticsEvents.filter(e => 
        e.createdAt >= dayStart && e.createdAt <= dayEnd
      )

      const dayEngagement = dayEvents.filter(e => 
        ['content_like', 'content_comment', 'content_share'].includes(e.event)
      ).length

      timeSeriesData.push({
        date: currentDate.toISOString().split('T')[0],
        views: dayViews,
        engagement: dayEngagement,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Audience insights (simplified)
    const uniqueViewers = new Set(viewTracking.map(v => v.ipAddress)).size
    const averageViewsPerViewer = uniqueViewers > 0 ? totalViews / uniqueViewers : 0

    const analytics = {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
        budget: campaign.budgetIdr,
        targetViewers: campaign.targetViewers,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
      },
      overview: {
        totalPromotions,
        activePromotions,
        totalViews,
        totalClicks,
        totalEngagement,
        engagementRate: Math.round(engagementRate * 100) / 100,
        clickThroughRate: Math.round(clickThroughRate * 100) / 100,
        uniqueViewers,
        averageViewsPerViewer: Math.round(averageViewsPerViewer * 100) / 100,
        progressPercentage: campaign.targetViewers > 0 
          ? Math.min((totalViews / campaign.targetViewers) * 100, 100) 
          : 0,
      },
      platformBreakdown: Object.values(platformBreakdown),
      topPerformingPromotions,
      timeSeriesData,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        period,
      },
    }

    res.status(200).json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    console.error('Campaign analytics error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch campaign analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}
