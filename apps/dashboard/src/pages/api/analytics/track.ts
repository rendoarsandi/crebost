import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@crebost/database'
import { AnalyticsEvent, ANALYTICS_EVENTS } from '@crebost/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const event: AnalyticsEvent = req.body

    if (!event.userId || !event.event) {
      return res.status(400).json({ error: 'userId and event are required' })
    }

    // Validate event type
    const validEvents = Object.values(ANALYTICS_EVENTS)
    if (!validEvents.includes(event.event as any)) {
      return res.status(400).json({ error: 'Invalid event type' })
    }

    // Get client IP and user agent
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
    const userAgent = req.headers['user-agent'] || 'unknown'
    const referrer = req.headers.referer || req.headers.referrer

    // Store analytics event
    await prisma.analytics.create({
      data: {
        userId: event.userId,
        campaignId: event.campaignId,
        promotionId: event.promotionId,
        event: event.event,
        metadata: event.metadata || {},
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        userAgent,
        referrer,
        createdAt: event.timestamp || new Date(),
      },
    })

    // Handle specific event types that need additional processing
    await handleSpecificEvent(event, ipAddress, userAgent)

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    res.status(500).json({ error: 'Failed to track analytics event' })
  }
}

async function handleSpecificEvent(
  event: AnalyticsEvent,
  ipAddress: string | string[],
  userAgent: string
) {
  const clientIp = Array.isArray(ipAddress) ? ipAddress[0] : ipAddress

  switch (event.event) {
    case ANALYTICS_EVENTS.CONTENT_VIEW:
      await handleContentView(event, clientIp, userAgent)
      break
    
    case ANALYTICS_EVENTS.PROMOTION_VIEWED:
      await handlePromotionView(event)
      break
    
    case ANALYTICS_EVENTS.CAMPAIGN_VIEWED:
      await handleCampaignView(event)
      break
    
    case ANALYTICS_EVENTS.CONTENT_CLICK:
      await handleContentClick(event)
      break
    
    default:
      // No special handling needed for other events
      break
  }
}

async function handleContentView(
  event: AnalyticsEvent,
  ipAddress: string,
  userAgent: string
) {
  if (!event.promotionId) return

  try {
    // Update promotion view count
    await prisma.promotion.update({
      where: { id: event.promotionId },
      data: {
        viewsCount: {
          increment: 1,
        },
        lastViewedAt: new Date(),
      },
    })

    // Create view tracking record
    await prisma.viewTracking.create({
      data: {
        promotionId: event.promotionId,
        campaignId: event.campaignId,
        promoterId: event.userId,
        ipAddress,
        userAgent,
        referrer: event.metadata?.referrer,
        platform: event.metadata?.platform,
        contentUrl: event.metadata?.contentUrl,
        viewedAt: event.timestamp || new Date(),
      },
    })

    // Update campaign total views if campaign exists
    if (event.campaignId) {
      await prisma.campaign.update({
        where: { id: event.campaignId },
        data: {
          totalViews: {
            increment: 1,
          },
        },
      })
    }
  } catch (error) {
    console.error('Error handling content view:', error)
  }
}

async function handlePromotionView(event: AnalyticsEvent) {
  if (!event.promotionId) return

  try {
    await prisma.promotion.update({
      where: { id: event.promotionId },
      data: {
        viewsCount: {
          increment: 1,
        },
        lastViewedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Error handling promotion view:', error)
  }
}

async function handleCampaignView(event: AnalyticsEvent) {
  if (!event.campaignId) return

  try {
    await prisma.campaign.update({
      where: { id: event.campaignId },
      data: {
        totalViews: {
          increment: 1,
        },
      },
    })
  } catch (error) {
    console.error('Error handling campaign view:', error)
  }
}

async function handleContentClick(event: AnalyticsEvent) {
  if (!event.promotionId) return

  try {
    // Update promotion click count
    await prisma.promotion.update({
      where: { id: event.promotionId },
      data: {
        clicksCount: {
          increment: 1,
        },
      },
    })

    // Update campaign click count if campaign exists
    if (event.campaignId) {
      await prisma.campaign.update({
        where: { id: event.campaignId },
        data: {
          totalClicks: {
            increment: 1,
          },
        },
      })
    }
  } catch (error) {
    console.error('Error handling content click:', error)
  }
}
