import { PrismaClient, SocialPlatform, PromotionPost, Account, Prisma } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

// Impor (akan dibuat) fungsi spesifik platform
import { fetchTikTokMetrics, TikTokMetrics } from './platforms/tiktok';
import { fetchInstagramMetrics, InstagramMetrics } from './platforms/instagram';
import { fetchYouTubeMetrics, YouTubeMetrics } from './platforms/youtube';

export interface Env {
  DB: D1Database;
  // METRIC_HARVEST_QUEUE: Queue; // Ini adalah queue yang di-consume, jadi tidak perlu binding producer di sini
  YOUTUBE_API_KEY?: string;
  // Tambahkan secret lain jika diperlukan untuk refresh token aplikasi, dll.
  // SECRET_TIKTOK_APP_CLIENT_SECRET: string;
}

export interface MetricHarvestMessage {
  promotionPostId: string;
  // platform: SocialPlatform; // platform bisa diambil dari promotionPost.platform
  // postUrl: string; // postUrl bisa diambil dari promotionPost.postUrl
  // externalPostId?: string | null; // externalPostId bisa diambil dari promotionPost.externalPostId
  // promoterId: string; // promoterId bisa diambil dari promotionPost.promotion.promoterId
  // Cukup promotionPostId, sisanya bisa di-query dari DB untuk data terbaru
}

type PlatformMetrics = TikTokMetrics | InstagramMetrics | YouTubeMetrics | null;

let prisma: PrismaClient;

export default {
  async queue(batch: MessageBatch<MetricHarvestMessage>, env: Env, ctx: ExecutionContext): Promise<void> {
    if (!prisma) {
      const adapter = new PrismaD1(env.DB);
      prisma = new PrismaClient({ adapter });
    }

    console.log(`[social-api-harvester] Received batch of ${batch.messages.length} messages from queue ${batch.queue}`);

    const processingPromises = batch.messages.map(async (message) => {
      const { promotionPostId } = message.body;
      console.log(`[social-api-harvester] Processing message for promotionPostId: ${promotionPostId}`);

      try {
        const promotionPost = await prisma.promotionPost.findUnique({
          where: { id: promotionPostId },
          include: { promotion: { select: { promoterId: true } } },
        });

        if (!promotionPost || !promotionPost.promotion?.promoterId) {
          console.error(`[social-api-harvester] PromotionPost ${promotionPostId} or its promoter not found. Acking.`);
          message.ack();
          return;
        }

        // Optimistic update to FETCHING, and update lastCheckedAt
        await prisma.promotionPost.update({
            where: { id: promotionPostId },
            data: { fetchStatus: 'FETCHING', lastCheckedAt: new Date(), errorMessage: null },
        });

        const promoterId = promotionPost.promotion.promoterId;
        const platform = promotionPost.platform;
        const postUrl = promotionPost.postUrl;
        const externalPostId = promotionPost.externalPostId;

        // Ambil token OAuth promotor
        const account = await prisma.account.findFirst({
          where: {
            userId: promoterId,
            provider: platform.toLowerCase(), // Asumsi nama provider di Account cocok dengan enum SocialPlatform (lowercase)
          },
          orderBy: { createdAt: 'desc' }
        });

        if (!account?.access_token) {
          const errorMsg = `Missing or invalid OAuth token for promoter ${promoterId}, platform ${platform}.`;
          console.error(`[social-api-harvester] ${errorMsg}`);
          await prisma.promotionPost.update({
            where: { id: promotionPostId },
            data: { fetchStatus: 'FETCHED_ERROR_AUTH', errorMessage: errorMsg.substring(0, 255) },
          });
          message.ack(); // Error otentikasi, tidak perlu retry dengan data yang sama.
          return;
        }

        let accessToken = account.access_token;
        // TODO: Implement Access Token Refresh Logic if token is expired
        // if (account.expires_at && (account.expires_at * 1000) < Date.now()) {
        //   console.log(`Token for ${promoterId}/${platform} expired. Attempting refresh...`);
        //   try {
        //     const newTokens = await refreshTokenForPlatform(platform, account.refresh_token, env);
        //     accessToken = newTokens.access_token;
        //     await prisma.account.update({ where: { id: account.id }, data: { ...newTokens }});
        //   } catch (refreshError) {
        //     const errorMsg = `Token refresh failed for ${promoterId}/${platform}: ${refreshError.message}`;
        //     console.error(`[social-api-harvester] ${errorMsg}`);
        //     await prisma.promotionPost.update({ where: { id: promotionPostId }, data: { fetchStatus: 'FETCHED_ERROR_AUTH', errorMessage: errorMsg.substring(0,255) }});
        //     message.ack(); return;
        //   }
        // }


        let metrics: PlatformMetrics = null;
        let platformError: Error | null = null;

        try {
          switch (platform) {
            case SocialPlatform.TIKTOK:
              metrics = await fetchTikTokMetrics(postUrl, externalPostId, accessToken, env);
              break;
            case SocialPlatform.INSTAGRAM:
              metrics = await fetchInstagramMetrics(postUrl, externalPostId, accessToken, env);
              break;
            case SocialPlatform.YOUTUBE:
              const apiKey = env.YOUTUBE_API_KEY || null;
              metrics = await fetchYouTubeMetrics(postUrl, externalPostId, accessToken, apiKey, env);
              break;
            default:
              platformError = new Error(`Unsupported platform: ${platform}`);
          }
        } catch (err: any) {
            platformError = err;
        }

        if (platformError) {
            console.error(`[social-api-harvester] Error fetching metrics for ${platform} post ${postUrl} (ID: ${promotionPostId}): ${platformError.message}`);
            // TODO: Differentiate transient errors (retry) vs permanent (ack)
            // For now, assume most API call errors might be transient or fixable (e.g. token)
            // If it's a 404 for the post, it's permanent. If it's rate limit, it's transient.
            // Cloudflare Queues akan auto-retry berdasarkan konfigurasi di wrangler.toml
            // Jika setelah semua retry gagal, pesan akan masuk DLQ (jika ada) atau di-drop.
            // Kita update status di DB agar tidak dicoba terus menerus oleh scheduler.
             await prisma.promotionPost.update({
                where: { id: promotionPostId },
                data: { fetchStatus: 'FETCHED_ERROR_API', errorMessage: platformError.message.substring(0, 255) },
            });
            // Melempar error akan menyebabkan message.retry() oleh CF Queues
            // throw platformError;
            // Atau jika ingin kontrol penuh, jangan lempar error tapi jangan ack jika mau retry dari kode:
            // message.retry({delaySeconds: ...}); return;
            // Untuk sekarang, kita ack setelah mencatat error, mengandalkan scheduler untuk enqueue lagi nanti jika perlu.
            message.ack();
            return;
        }

        if (metrics) {
          await prisma.platformMetricSnapshot.create({
            data: {
              promotionPostId: promotionPostId,
              fetchedAt: new Date(), // Waktu data ini diambil dan disimpan
              views: metrics.views,
              likes: metrics.likes,
              comments: metrics.comments,
              shares: metrics.shares,
              rawData: (metrics.rawData as Prisma.InputJsonObject) || Prisma.JsonNull,
            },
          });

          await prisma.promotionPost.update({
            where: { id: promotionPostId },
            data: {
              fetchStatus: 'FETCHED_SUCCESS',
              errorMessage: null,
              lastCheckedAt: new Date(), // Diupdate lagi di sini setelah sukses
              // nextCheckAt: ... // Logic untuk nextCheckAt bisa di scheduler
            },
          });
          console.log(`[social-api-harvester] Successfully fetched and stored metrics for ${promotionPostId}`);
        } else {
          // Kasus di mana tidak ada error tapi metrik null (seharusnya tidak terjadi jika error ditangkap)
          const errorMsg = "Metrics fetch resulted in null data without explicit error.";
          console.error(`[social-api-harvester] ${errorMsg} for ${promotionPostId}`);
          await prisma.promotionPost.update({
            where: { id: promotionPostId },
            data: { fetchStatus: 'FETCHED_ERROR_NODATA', errorMessage: errorMsg },
          });
        }
        message.ack();
      } catch (error: any) {
        console.error(`[social-api-harvester] CRITICAL error processing message for promotionPostId ${promotionPostId}. Error: ${error.message}. Stack: ${error.stack}. Message will be retried by queue.`);
        // Melempar error di sini akan menyebabkan message di-NACK dan di-retry oleh sistem Queue
        // sesuai konfigurasi `max_retries`.
        throw error;
      }
    });

    await Promise.allSettled(processingPromises);
    console.log("[social-api-harvester] Batch processing complete.");
  },
};

// Placeholder untuk fungsi refresh token (perlu implementasi detail per platform)
// async function refreshTokenForPlatform(platform: SocialPlatform, refreshToken: string | null, env: Env): Promise<{access_token: string, expires_at?: number, refresh_token?: string}> {
//   if (!refreshToken) throw new Error("No refresh token available.");
//   // Logika spesifik per platform untuk call endpoint refresh token
//   // Menggunakan env.SECRET_TIKTOK_APP_CLIENT_ID, env.SECRET_TIKTOK_APP_CLIENT_SECRET, dll.
//   console.log(`Attempting to refresh token for ${platform}...`);
//   throw new Error(`Token refresh logic for ${platform} not implemented.`);
//   // return { access_token: "new_refreshed_access_token", expires_at: Date.now()/1000 + 3600 };
// }
