import { PrismaClient, PromotionPost, SocialPlatform, BotThreshold, PlatformMetricSnapshot, Prisma } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { calculateDerivedMetrics, applyBotDetectionRules, AnalysisResult } from './analysisRules';

export interface Env {
  DB: D1Database;
  // Vars atau secrets lain jika diperlukan
}

let prisma: PrismaClient;

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    if (!prisma) {
      const adapter = new PrismaD1(env.DB);
      prisma = new PrismaClient({ adapter });
    }

    console.log(`[bot-analyzer] Cron event triggered: ${event.cron} at ${new Date(event.scheduledTime).toISOString()}`);

    try {
      const postsToAnalyze = await prisma.promotionPost.findMany({
        where: {
          // Ambil postingan yang sudah berhasil di-fetch setidaknya sekali
          // dan belum dianalisis atau statusnya memungkinkan untuk dianalisis ulang.
          fetchStatus: 'FETCHED_SUCCESS',
          OR: [
            { botAnalysisStatus: 'NOT_ANALYZED' },
            { botAnalysisStatus: 'ANALYZING_PENDING' },
            // TODO: Tambahkan logika untuk re-evaluasi periodik jika perlu
            // Misalnya, jika botAnalysisStatus adalah NORMAL tapi updatedAt sudah lama
            // { botAnalysisStatus: 'NORMAL', updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Contoh: re-evaluasi mingguan
          ],
        },
        include: {
          metricSnapshots: {
            orderBy: { fetchedAt: 'asc' },
            // Batasi jumlah snapshot yang diambil jika sangat banyak, atau ambil semua untuk analisis lengkap
            // take: 100, // Contoh
          },
          promotion: {
            select: {
                id: true,
                // overallBotStatus: true // Untuk logika update overallBotStatus di Promotion
            }
          }
        },
        take: 50, // Batasi jumlah postingan yang dianalisis per run cron
      });

      if (postsToAnalyze.length === 0) {
        console.log("[bot-analyzer] No promotion posts found needing analysis at this time.");
        return;
      }

      console.log(`[bot-analyzer] Found ${postsToAnalyze.length} posts to analyze.`);

      const activeThresholds = await prisma.botThreshold.findMany({
        where: { isActive: true }
      });

      for (const post of postsToAnalyze) {
        // Tandai sebagai sedang dianalisis untuk mencegah pemrosesan ganda oleh run cron lain
        await prisma.promotionPost.update({
            where: { id: post.id },
            data: { botAnalysisStatus: 'ANALYZING' }
        });

        if (post.metricSnapshots.length < 2) { // Butuh minimal 2 snapshot untuk analisis tren dasar
          await prisma.promotionPost.update({
            where: { id: post.id },
            data: {
                botAnalysisStatus: 'INSUFFICIENT_DATA',
                errorMessage: 'Not enough metric snapshots for analysis (requires at least 2).',
            },
          });
          console.log(`[bot-analyzer] Post ${post.id} has insufficient data (${post.metricSnapshots.length} snapshots). Marked and skipped.`);
          continue;
        }

        console.log(`[bot-analyzer] Analyzing post ${post.id} on platform ${post.platform} with ${post.metricSnapshots.length} snapshots.`);

        const calculatedMetrics = calculateDerivedMetrics(post.id, post.platform, post.metricSnapshots);

        const relevantThresholds = activeThresholds.filter(t =>
            (!t.platform || t.platform === post.platform)
        );

        const analysisResult = applyBotDetectionRules(calculatedMetrics, relevantThresholds);

        await prisma.promotionPost.update({
          where: { id: post.id },
          data: {
            botAnalysisStatus: analysisResult.status,
            errorMessage: (analysisResult.status !== 'NORMAL' && analysisResult.status !== 'INSUFFICIENT_DATA')
                          ? analysisResult.reason.substring(0, 255) // Batasi panjang error message
                          : null,
            // Anda bisa menambahkan field baru di PromotionPost untuk menyimpan `analysisResult.score` atau `analysisResult.details` (JSON)
            // Misalnya: analysisDetails: (analysisResult.details as Prisma.JsonObject) || Prisma.JsonNull,
            //          suspicionScore: analysisResult.score,
          },
        });

        console.log(`[bot-analyzer] Post ${post.id} analysis complete. Status: ${analysisResult.status}. Reason: ${analysisResult.reason.substring(0,150)}...`);

        // TODO: Logika untuk update Promotion.overallBotStatus
        // Ini mungkin perlu query semua PromotionPost untuk Promotion tersebut dan mengambil status terburuk/agregat.
        // Contoh sederhana: jika ada satu post BOT_LIKELY, maka Promotion jadi FLAGGED_SUSPICIOUS atau lebih tinggi.
        // if (analysisResult.status === 'BOT_LIKELY' || analysisResult.status === 'SUSPICIOUS') {
        //    const promotionToUpdate = await prisma.promotion.findUnique({where: {id: post.promotionId}});
        //    if (promotionToUpdate && promotionToUpdate.overallBotStatus !== 'CONFIRMED_BOT') { // Jangan override jika sudah confirmed bot
        //        await prisma.promotion.update({
        //            where: {id: post.promotionId},
        //            data: { overallBotStatus: analysisResult.status === 'BOT_LIKELY' ? 'FLAGGED_BOT_LIKELY' : 'FLAGGED_SUSPICIOUS' }
        //        });
        //    }
        // }
      }
      console.log(`[bot-analyzer] Finished analyzing ${postsToAnalyze.length} posts.`);

    } catch (error: any) {
      console.error(`[bot-analyzer] Error during scheduled execution: ${error.message}`, error.stack);
    }
  },

  // Fungsi untuk mengupdate threshold, bisa dipanggil oleh cron lain atau secara manual
  // async updateThresholds(env: Env) {
  //   if (!prisma) { /* init prisma */ }
  //   // Panggil fungsi dari analysisRules.ts untuk update threshold per platform/metricType
  //   // await updatePlatformThresholds(prisma, SocialPlatform.TIKTOK, 'DAILY_VIEW_INCREASE');
  //   console.log("[bot-analyzer] Threshold update process completed.");
  // }
};
