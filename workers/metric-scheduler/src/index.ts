import { PrismaClient, PromotionPost, SocialPlatform, Prisma } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

export interface Env {
  DB: D1Database;
  METRIC_HARVEST_QUEUE: Queue;
}

export interface MetricHarvestMessage {
  promotionPostId: string;
  // Menyertakan info tambahan di sini bisa mengurangi beban query di harvester,
  // tapi juga bisa menyebabkan data usang jika harvester punya delay signifikan.
  // Untuk sekarang, hanya ID. Harvester akan fetch data terbaru.
  // platform: SocialPlatform;
  // postUrl: string;
  // externalPostId?: string | null;
  // promoterId: string;
}

let prisma: PrismaClient;

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    if (!prisma) {
      const adapter = new PrismaD1(env.DB);
      prisma = new PrismaClient({ adapter });
    }

    console.log(`[metric-scheduler] Cron event triggered: ${event.cron} at ${new Date(event.scheduledTime).toISOString()}`);

    try {
      const now = new Date();
      // Logika pemilihan postingan yang lebih cermat:
      // - Yang belum pernah dicek (lastCheckedAt is null)
      // - Yang sudah waktunya dicek lagi (nextCheckAt <= now)
      // - Yang error API non-auth, coba lagi setelah interval (misal, 1 jam)
      // - Yang sukses, cek lagi setelah interval lebih panjang (misal, 4-24 jam, tergantung frekuensi update yang diinginkan)

      const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
      // const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const postsToSchedule = await prisma.promotionPost.findMany({
        where: {
          promotion: {
            status: {
              in: ['AWAITING_METRICS', 'UNDER_REVIEW', 'APPROVED'] // Hanya promosi yang masih aktif/relevan
              // Anda mungkin ingin menambahkan status lain dari Campaign juga, misal Campaign.status = 'ACTIVE'
            }
          },
          fetchStatus: {
            notIn: [
              'FETCHED_ERROR_AUTH', // Jangan re-queue yang error otentikasi permanen
              'SUBMIT_INVALID_URL', // Jangan re-queue URL yang sudah invalid dari awal
              'FETCHING' // Jangan re-queue yang sedang di-fetch
            ]
          },
          OR: [
            { lastCheckedAt: null }, // Belum pernah dicek sama sekali
            { nextCheckAt: null },   // Safety net jika nextCheckAt tidak pernah di-set
            { nextCheckAt: { lte: now } }, // Sudah waktunya dicek berdasarkan jadwalnya
            { // Untuk yang sukses, tapi sudah cukup lama tidak dicek
              fetchStatus: 'FETCHED_SUCCESS',
              lastCheckedAt: { lte: fourHoursAgo } // Cek ulang setiap X jam
            },
            { // Untuk yang error API (bukan auth), coba lagi setelah interval pendek
              fetchStatus: { in: ['FETCHED_ERROR_API', 'FETCHED_ERROR_NODATA'] },
              updatedAt: { lte: oneHourAgo } // Hanya jika errornya sudah lebih dari 1 jam yang lalu
            }
          ],
        },
        orderBy: [
            { lastCheckedAt: { sort: 'asc', nulls: 'first' } },
            { nextCheckAt: { sort: 'asc', nulls: 'first' } },
            { submittedAt: 'asc' }
        ],
        take: 100, // Batas jumlah pesan yang dikirim per eksekusi cron. Sesuaikan!
                  // Max batch send ke Queue adalah 100.
        select: {
          id: true,
        }
      });

      if (postsToSchedule.length === 0) {
        console.log("[metric-scheduler] No promotion posts found needing a metric harvest at this time.");
        return;
      }

      const messages: MessageSendRequest<MetricHarvestMessage>[] = postsToSchedule.map(post => ({
        contentType: "json", // Penting untuk Cloudflare Queues jika body adalah objek
        body: {
          promotionPostId: post.id,
        },
      }));

      // Kirim batch pesan ke queue
      // Jika messages.length > 100, perlu di-chunk menjadi beberapa batch.
      const MAX_BATCH_SEND_SIZE = 100;
      for (let i = 0; i < messages.length; i += MAX_BATCH_SEND_SIZE) {
        const chunk = messages.slice(i, i + MAX_BATCH_SEND_SIZE);
        await env.METRIC_HARVEST_QUEUE.sendBatch(chunk);
        console.log(`[metric-scheduler] Sent a batch of ${chunk.length} messages to METRIC_HARVEST_QUEUE.`);
      }

      console.log(`[metric-scheduler] Successfully enqueued ${messages.length} promotion posts for metric harvesting.`);

      // Update `nextCheckAt` untuk postingan yang baru saja di-queue untuk mencegah re-queue langsung
      // dan tandai sebagai 'QUEUED' atau update `lastCheckedAt` untuk menunjukkan upaya penjadwalan.
      // Waktu nextCheckAt yang lebih presisi sebaiknya di-set oleh harvester setelah selesai atau gagal.
      // Di sini kita set sementara agar tidak langsung diambil lagi oleh scheduler ini.
      const nowPlus થોડી देर = new Date(Date.now() + 15 * 60 * 1000); // 15 menit dari sekarang

      await prisma.promotionPost.updateMany({
        where: {
          id: { in: postsToSchedule.map(p => p.id) }
        },
        data: {
          // fetchStatus: 'QUEUED', // Opsional, jika Anda ingin status ini
          nextCheckAt: nowPlus થોડી देर
        }
      });
      console.log(`[metric-scheduler] Updated nextCheckAt for ${postsToSchedule.length} posts.`);

    } catch (error: any) {
      console.error(`[metric-scheduler] Error during scheduled execution: ${error.message}`, error.stack);
    } finally {
      // Untuk long-running scheduled events, disarankan untuk tidak disconnect client
      // jika akan digunakan lagi di invokasi berikutnya dalam waktu dekat.
      // Namun, jika worker hanya berjalan per cron, disconnect bisa jadi pilihan.
      // Untuk saat ini, biarkan koneksi dikelola oleh runtime CF.
      // await prisma.$disconnect();
    }
  },
};
