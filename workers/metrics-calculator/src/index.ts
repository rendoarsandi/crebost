import { PrismaClient, Prisma, UserDailyMetric, BotThreshold, User, Transaction } from '@prisma/client'; // Tambahkan Transaction
import { PrismaD1 } from '@prisma/adapter-d1';

export interface Env {
  DB: D1Database;
}

function getPreviousHourTimestamps(scheduledDateTime: Date): { start: Date; end: Date } {
  const end = new Date(scheduledDateTime);
  end.setMinutes(0, 0, 0);
  const start = new Date(end);
  start.setHours(start.getHours() - 1);
  return { start, end };
}

function getPreviousUTCDayTimestamps(scheduledDateTime: Date): { start: Date; end: Date } {
  const end = new Date(scheduledDateTime);
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 1);
  return { start, end };
}

async function processHourlyActivity(prisma: PrismaClient, processingDateTimeForJob: Date) {
  console.log(`Starting hourly activity processing, job triggered at: ${processingDateTimeForJob.toISOString()}`);
  const { start, end } = getPreviousHourTimestamps(processingDateTimeForJob);
  console.log(`Aggregating ActivityLog from ${start.toISOString()} (inclusive) to ${end.toISOString()} (exclusive) for UserHourlyActivity.`);

  try {
    const activities = await prisma.activityLog.groupBy({
      by: ['userId', 'activityType'],
      where: {
        createdAt: { gte: start, lt: end },
        userId: { not: null },
      },
      _count: { id: true },
    });

    if (activities.length === 0) {
      console.log("No activities found in ActivityLog for the previous hour.");
      return;
    }

    const userAggregates: Record<string, { userId: string; totalViews: number; totalLikes: number; totalComments: number }> = {};
    for (const group of activities) {
      if (!group.userId) continue;
      const userId = group.userId;
      if (!userAggregates[userId]) {
        userAggregates[userId] = { userId, totalViews: 0, totalLikes: 0, totalComments: 0 };
      }
      if (group.activityType === 'VIEW') userAggregates[userId].totalViews += group._count.id;
      else if (group.activityType === 'LIKE') userAggregates[userId].totalLikes += group._count.id;
      else if (group.activityType === 'COMMENT') userAggregates[userId].totalComments += group._count.id;
    }

    const upsertOperations = Object.values(userAggregates).map(agg => prisma.userHourlyActivity.upsert({
      where: { userId_hourStartTimestamp: { userId: agg.userId, hourStartTimestamp: start } },
      update: { totalViews: agg.totalViews, totalLikes: agg.totalLikes, totalComments: agg.totalComments },
      create: { userId: agg.userId, hourStartTimestamp: start, totalViews: agg.totalViews, totalLikes: agg.totalLikes, totalComments: agg.totalComments },
    }));

    if (upsertOperations.length > 0) {
      await prisma.$transaction(upsertOperations);
      console.log(`Successfully processed and upserted ${upsertOperations.length} UserHourlyActivity records.`);
    } else {
      console.log("No UserHourlyActivity records to upsert.");
    }
  } catch (error) {
    console.error("Error processing hourly activity:", error instanceof Error ? error.message : String(error));
    if (error instanceof Prisma.PrismaClientKnownRequestError) console.error("Prisma error code:", error.code);
  }
}

// Fungsi untuk menghitung standar deviasi
function calculateStandardDeviation(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.length - 1); // Sample variance
  return Math.sqrt(variance);
}

async function updateGlobalBotThresholds(prisma: PrismaClient) {
  console.log("Starting update of global bot thresholds (mu and sigma)...");
  try {
    const normalUserMetrics = await prisma.userDailyMetric.findMany({
      where: {
        user: { status: 'ACTIVE' },
        // Optional: Consider only recent data for mu and sigma calculation
        // date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
      },
      select: { averageActivitiesPerMinute: true },
    });

    if (normalUserMetrics.length < 10) { // Need a minimum number of samples
      console.warn(`Not enough normal user metric samples (${normalUserMetrics.length}) to calculate thresholds. Skipping update.`);
      // Consider creating/updating with default/fallback values if needed
      // await prisma.botThreshold.upsert(...);
      return;
    }

    const values = normalUserMetrics.map(m => m.averageActivitiesPerMinute);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / values.length;
    const stdDev = calculateStandardDeviation(values, mean);

    const thresholdName = "global_default";
    await prisma.botThreshold.upsert({
      where: { name: thresholdName },
      update: { mean: mean, stdDev: stdDev, isActive: true },
      create: {
        name: thresholdName,
        mean: mean,
        stdDev: stdDev,
        levelAMultiplier: 3.0,
        levelBMinMultiplier: 2.0,
        levelBMaxMultiplier: 3.0,
        isActive: true,
        description: "Global default thresholds for bot detection.",
      },
    });
    console.log(`Successfully updated bot thresholds: mu = ${mean.toFixed(4)}, sigma = ${stdDev.toFixed(4)}`);
  } catch (error) {
    console.error("Error updating global bot thresholds:", error instanceof Error ? error.message : String(error));
  }
}

async function applyBotDetectionLogic(
    prisma: PrismaClient,
    userId: string,
    dailyMetricId: string,
    averageActivitiesPerMinute: number,
    activeThreshold: BotThreshold | null
): Promise<void> {
    if (!activeThreshold) {
        console.warn(`Skipping bot detection for User ${userId}, DailyMetric ${dailyMetricId}: No active threshold provided.`);
        await prisma.userDailyMetric.update({
            where: { id: dailyMetricId },
            data: {
                botDetectionLevel: 'NORMAL',
                botDetectionReason: 'Bot detection skipped: No active threshold configured.',
                isPayoutAllowed: true,
            },
        });
        return;
    }

    const { mean, stdDev, levelAMultiplier, levelBMinMultiplier, levelBMaxMultiplier } = activeThreshold;
    let detectionLevel = 'NORMAL';
    let reason = 'Activity within normal range.';
    let allowPayout = true;
    let userStatusToUpdate: Prisma.UserUpdateInput | null = null;

    const upperLevelA = mean + levelAMultiplier * stdDev;
    const effectiveLevelBMaxMultiplier = Math.max(levelBMinMultiplier, levelBMaxMultiplier);
    const upperLevelBBoundary = mean + effectiveLevelBMaxMultiplier * stdDev;
    const lowerLevelBBoundary = mean + levelBMinMultiplier * stdDev;

    if (stdDev === 0) {
        if (averageActivitiesPerMinute > mean) {
            detectionLevel = 'WARNING_LEVEL_B';
            reason = `Activity (${averageActivitiesPerMinute.toFixed(2)}) deviates from mean (${mean.toFixed(2)}) with zero std dev.`;
            allowPayout = false;
            if (averageActivitiesPerMinute > mean * 1.5) {
                 detectionLevel = 'BANNED_LEVEL_A';
                 userStatusToUpdate = { status: 'BANNED' };
            }
        }
    } else {
        if (averageActivitiesPerMinute > upperLevelA) {
            detectionLevel = 'BANNED_LEVEL_A';
            reason = `High activity (${averageActivitiesPerMinute.toFixed(2)}) exceeded Level A threshold (> ${upperLevelA.toFixed(2)}). Mu=${mean.toFixed(2)}, Sigma=${stdDev.toFixed(2)}.`;
            allowPayout = false;
            userStatusToUpdate = { status: 'BANNED' };
        } else if (averageActivitiesPerMinute > lowerLevelBBoundary && averageActivitiesPerMinute <= upperLevelBBoundary) {
            detectionLevel = 'WARNING_LEVEL_B';
            reason = `Moderate high activity (${averageActivitiesPerMinute.toFixed(2)}) within Level B range (${lowerLevelBBoundary.toFixed(2)} - ${upperLevelBBoundary.toFixed(2)}). Mu=${mean.toFixed(2)}, Sigma=${stdDev.toFixed(2)}.`;
        }
    }

    await prisma.userDailyMetric.update({
        where: { id: dailyMetricId },
        data: {
            botDetectionLevel: detectionLevel,
            botDetectionReason: reason,
            isPayoutAllowed: allowPayout,
        },
    });

    if (userStatusToUpdate) {
        await prisma.user.update({
            where: { id: userId },
            data: userStatusToUpdate,
        });
        console.log(`User ${userId} status updated to ${userStatusToUpdate.status} due to bot detection.`);
    }

    if (detectionLevel === 'WARNING_LEVEL_B') {
        console.log(`User ${userId} flagged with WARNING_LEVEL_B. Reason: ${reason}. Consider audit/notification.`);
        // TODO: Notification logic here
    }
}

// Konstanta untuk RateFee
const RATE_FEE_PER_AVERAGE_ACTIVITY_MINUTE_IDR = 10; // Contoh: Rp 10 per unit R_rata_rata

async function calculateAndRecordPayout(
    prisma: PrismaClient,
    userId: string,
    dailyMetric: UserDailyMetric,
    rateFee: number
): Promise<void> {
    if (!dailyMetric.isPayoutAllowed || dailyMetric.averageActivitiesPerMinute <= 0) {
        console.log(`Payout skipped for User ${userId}, DailyMetric ${dailyMetric.id}. isPayoutAllowed: ${dailyMetric.isPayoutAllowed}, AvgActivity: ${dailyMetric.averageActivitiesPerMinute}.`);
        if (dailyMetric.totalPayoutIdr !== 0) {
            await prisma.userDailyMetric.update({
                where: { id: dailyMetric.id },
                data: { totalPayoutIdr: 0 },
            });
        }
        return;
    }

    const payoutAmount = dailyMetric.averageActivitiesPerMinute * rateFee;

    if (payoutAmount <= 0) {
        console.log(`Calculated payout is zero or negative for User ${userId}, DailyMetric ${dailyMetric.id}. Amount: ${payoutAmount}.`);
        if (dailyMetric.totalPayoutIdr !== 0) {
             await prisma.userDailyMetric.update({
                where: { id: dailyMetric.id },
                data: { totalPayoutIdr: 0 },
            });
        }
        return;
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.userDailyMetric.update({
                where: { id: dailyMetric.id },
                data: { totalPayoutIdr: payoutAmount },
            });
            await tx.transaction.create({
                data: {
                    userId: userId,
                    type: 'EARNING',
                    amountIdr: payoutAmount,
                    description: `Daily earning from activity on ${dailyMetric.date.toISOString().split('T')[0]}`,
                    referenceId: dailyMetric.id,
                    referenceType: 'UserDailyMetric',
                    status: 'COMPLETED',
                    processedAt: new Date(),
                },
            });
            await tx.user.update({
                where: { id: userId },
                data: {
                    balanceIdr: { increment: payoutAmount },
                    totalEarnedIdr: { increment: payoutAmount },
                },
            });
        });
        console.log(`Successfully recorded payout of IDR ${payoutAmount} for User ${userId}, DailyMetric ${dailyMetric.id}.`);
    } catch (error) {
        console.error(`Error recording payout for User ${userId}, DailyMetric ${dailyMetric.id}:`, error instanceof Error ? error.message : String(error));
    }
}

async function processDailyMetrics(prisma: PrismaClient, processingDateTimeForJob: Date) {
  console.log(`Starting daily metrics processing, job triggered at: ${processingDateTimeForJob.toISOString()}`);
  const { start, end } = getPreviousUTCDayTimestamps(processingDateTimeForJob);
  console.log(`Aggregating UserHourlyActivity from ${start.toISOString()} (inclusive) to ${end.toISOString()} (exclusive) for UserDailyMetric.`);

  try {
    const hourlyAggregatesForDay = await prisma.userHourlyActivity.groupBy({
        by: ['userId'],
        where: { hourStartTimestamp: { gte: start, lt: end } },
        _sum: { totalViews: true, totalLikes: true, totalComments: true },
    });

    if (hourlyAggregatesForDay.length === 0) {
      console.log("No UserHourlyActivity records found for the previous UTC day.");
      return;
    }

    const activeThreshold = await prisma.botThreshold.findFirst({
        where: { isActive: true, name: "global_default" },
    });

    if (!activeThreshold) {
        console.warn("No active bot threshold (global_default) found. Bot detection will be skipped, default payout policy might apply.");
    }

    for (const agg of hourlyAggregatesForDay) {
        if (!agg.userId) continue;
        const totalActivities = (agg._sum.totalViews || 0) + (agg._sum.totalLikes || 0) + (agg._sum.totalComments || 0);
        const averageActivitiesPerMinute = totalActivities / (24 * 60);
        const metricDate = start;

        let dailyMetric = await prisma.userDailyMetric.upsert({
            where: { userId_date: { userId: agg.userId, date: metricDate } },
            update: { averageActivitiesPerMinute: averageActivitiesPerMinute },
            create: {
                userId: agg.userId,
                date: metricDate,
                averageActivitiesPerMinute: averageActivitiesPerMinute,
                isPayoutAllowed: true,
                botDetectionLevel: 'NORMAL',
                botDetectionReason: activeThreshold ? 'Awaiting bot detection' : 'Bot detection skipped: No active threshold.',
                totalPayoutIdr: 0,
            },
        });

        await applyBotDetectionLogic(prisma, agg.userId, dailyMetric.id, averageActivitiesPerMinute, activeThreshold);

        const updatedDailyMetric = await prisma.userDailyMetric.findUnique({ where: { id: dailyMetric.id } });

        if (updatedDailyMetric) {
            await calculateAndRecordPayout(prisma, agg.userId, updatedDailyMetric, RATE_FEE_PER_AVERAGE_ACTIVITY_MINUTE_IDR);
        } else {
            console.error(`Could not find UserDailyMetric ${dailyMetric.id} after bot detection for User ${agg.userId}. Payout calculation skipped.`);
        }
    }
    console.log(`Successfully processed daily metrics, applied bot detection, and calculated payouts for ${hourlyAggregatesForDay.length} users.`);

  } catch (error) {
    console.error("Error processing daily metrics and payouts:", error instanceof Error ? error.message : String(error));
    if (error instanceof Prisma.PrismaClientKnownRequestError) console.error("Prisma error code:", error.code);
  }
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    let prismaInstance: PrismaClient | null = null;
    try {
        prismaInstance = new PrismaClient({ adapter: new PrismaD1(env.DB) });
        const scheduledDateTime = new Date(event.scheduledTime);
        console.log(`Cron event: ${event.cron}, Scheduled time: ${scheduledDateTime.toISOString()}`);

        if (event.cron === "5 * * * *") {
            console.log("Dispatching hourly aggregation job.");
            ctx.waitUntil(processHourlyActivity(prismaInstance, scheduledDateTime));
        } else if (event.cron === "15 0 * * *") {
            console.log("Dispatching daily aggregation and bot detection job.");
            ctx.waitUntil(processDailyMetrics(prismaInstance, scheduledDateTime));
        } else if (event.cron === "0 1 * * 1") { // Matches cron_weekly_threshold_update
            console.log("Dispatching global bot threshold update job.");
            ctx.waitUntil(updateGlobalBotThresholds(prismaInstance));
        } else {
            console.warn(`Unknown cron schedule received: ${event.cron}`);
        }
    } catch (e) {
        console.error("Error in scheduled event handler:", e instanceof Error ? e.message : String(e));
    }
  },
  // Fetch handler for manual triggering (optional)
  /*
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // ... (implementation for manual triggers)
  }
  */
};
