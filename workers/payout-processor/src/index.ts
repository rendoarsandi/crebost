import { PrismaClient, PromotionPost, Campaign, User, Transaction, Prisma, SocialPlatform } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

export interface Env {
  DB: D1Database;
}

let prisma: PrismaClient;

// Definisi tipe payload yang lebih spesifik untuk data yang di-include
type PromotionPostWithDetails = Prisma.PromotionPostGetPayload<{
  include: {
    promotion: {
      include: {
        campaign: true;
        promoter: true;
      }
    };
    metricSnapshots: {
      orderBy: { fetchedAt: 'desc' };
      take: 1;
    };
  }
}>;

function calculatePayoutAmount(
    post: PromotionPostWithDetails,
): number {
    let amount = 0;
    if (!post.metricSnapshots || post.metricSnapshots.length === 0) return 0;
    if (!post.promotion || !post.promotion.campaign) return 0;

    const latestMetrics = post.metricSnapshots[0];
    const campaign = post.promotion.campaign;

    const views = Number(latestMetrics.views || 0);
    // const likes = Number(latestMetrics.likes || 0);
    // const comments = Number(latestMetrics.comments || 0);

    // Contoh: Payout berdasarkan ratePerViewerIdr dari Campaign
    // Pastikan campaign.ratePerViewerIdr adalah nilai per 1 view.
    // Jika itu per 1000 views, maka: amount = (views / 1000) * campaign.ratePerViewerIdr;
    if (campaign.ratePerViewerIdr && views > 0) {
        amount = views * campaign.ratePerViewerIdr;
    }

    // TODO: Logika lebih lanjut jika payout berdasarkan likes, comments, atau kombinasi.
    // TODO: Pertimbangkan budget kampanye jika ada batas maksimal payout per promosi/postingan.
    //       Misalnya, jika (total payout sejauh ini + amount saat ini) > budget, sesuaikan amount.

    return parseFloat(amount.toFixed(2)); // Pembulatan ke 2 desimal
}


export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    if (!prisma) {
      const adapter = new PrismaD1(env.DB);
      prisma = new PrismaClient({ adapter });
    }

    console.log(`[payout-processor] Cron event triggered: ${event.cron} at ${new Date(event.scheduledTime).toISOString()}`);

    try {
      const postsReadyForPayout = await prisma.promotionPost.findMany({
        where: {
          botAnalysisStatus: 'NORMAL', // Hanya yang dianggap NORMAL oleh bot analyzer
          fetchStatus: 'FETCHED_SUCCESS', // Harus ada metrik yang sukses diambil
          status: { notIn: ['PAID', 'PAYOUT_REJECTED', 'PAYOUT_PROCESSING'] }, // Belum dibayar atau sedang diproses
          // ^ Asumsi Anda menambahkan field `status` di PromotionPost
          // Atau jika menggunakan `payoutTransactionId`:
          // payoutTransactionId: null,
          promotion: {
            status: 'APPROVED', // Promosi harus sudah disetujui secara keseluruhan
            // campaign: { status: 'ACTIVE' } // Kampanye juga harus aktif
          }
        },
        include: {
          promotion: {
            include: {
              campaign: true,
              promoter: true,
            }
          },
          metricSnapshots: {
            orderBy: { fetchedAt: 'desc' },
            take: 1,
          },
        },
        take: 25, // Batasi jumlah per run untuk menghindari timeout atau beban berlebih
      }) as PromotionPostWithDetails[]; // Cast ke tipe yang lebih spesifik

      if (postsReadyForPayout.length === 0) {
        console.log("[payout-processor] No promotion posts found ready for payout at this time.");
        return;
      }

      console.log(`[payout-processor] Found ${postsReadyForPayout.length} posts ready for payout.`);

      for (const post of postsReadyForPayout) {
        if (!post.promotion?.campaign || !post.promotion?.promoter || post.metricSnapshots.length === 0) {
          console.warn(`[payout-processor] Skipping post ${post.id} due to missing critical related data (campaign, promoter, or metrics).`);
          // Update status post agar tidak diambil lagi jika datanya memang tidak lengkap permanen
          await prisma.promotionPost.update({
              where: {id: post.id},
              data: { status: 'PAYOUT_ERROR_DATA', errorMessage: 'Missing campaign/promoter/metric data for payout.'}
          });
          continue;
        }

        const promoter = post.promotion.promoter;
        if (promoter.status !== 'ACTIVE') {
            console.log(`[payout-processor] Promoter ${promoter.id} for post ${post.id} is not ACTIVE (status: ${promoter.status}). Skipping payout.`);
            await prisma.promotionPost.update({
              where: {id: post.id},
              data: { status: 'PAYOUT_REJECTED', errorMessage: `Promoter status is ${promoter.status}.`}
            });
            continue;
        }

        // Tandai sebagai sedang diproses agar tidak diambil oleh run paralel (jika ada)
        // Ini memerlukan field 'status' di PromotionPost
        try {
            await prisma.promotionPost.update({
                where: { id: post.id },
                data: { status: 'PAYOUT_PROCESSING' }
            });
        } catch(e) {
            console.error(`[payout-processor] Failed to mark post ${post.id} as PAYOUT_PROCESSING. Skipping.`, e);
            continue;
        }

        const payoutAmount = calculatePayoutAmount(post);

        if (payoutAmount < 0.01) { // Minimal 0.01 (misal 1 Rupiah jika dikali 100)
          console.log(`[payout-processor] Calculated payout for post ${post.id} is too low or zero (Amount: ${payoutAmount}). Marking as paid with zero amount.`);
          await prisma.promotionPost.update({
              where: { id: post.id },
              data: {
                  status: 'PAID',
                  calculatedEarningsIdr: 0, // Pastikan field ini ada di PromotionPost
                  // payoutTransactionId: 'ZERO_PAYOUT_RECORD' // Atau cara lain menandai 0 payout
              }
          });
          // Update juga calculatedEarningsIdr di Promotion jika perlu
           await prisma.promotion.update({
                where: { id: post.promotionId },
                data: { calculatedEarningsIdr: { increment: 0 } } // Tetap update untuk konsistensi
            });
          continue;
        }

        try {
          const transactionResult = await prisma.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
              data: {
                userId: promoter.id,
                type: 'EARNING',
                amountIdr: payoutAmount,
                description: `Earning: ${post.platform} post (${post.postUrl.substring(0, 30)}...) for Prm ID: ${post.promotionId.substring(0,8)}`,
                referenceId: post.id,
                referenceType: 'PromotionPost',
                status: 'COMPLETED',
                processedAt: new Date(),
              },
            });

            await tx.user.update({
              where: { id: promoter.id },
              data: {
                balanceIdr: { increment: payoutAmount },
                totalEarnedIdr: { increment: payoutAmount },
              },
            });

            await tx.promotionPost.update({
              where: { id: post.id },
              data: {
                payoutTransactionId: newTransaction.id, // Field ini perlu ada di skema PromotionPost
                status: 'PAID',                        // Field ini perlu ada di skema PromotionPost
                calculatedEarningsIdr: payoutAmount,   // Field ini perlu ada di skema PromotionPost
              },
            });

            await tx.promotion.update({
                where: { id: post.promotionId },
                data: {
                    calculatedEarningsIdr: { increment: payoutAmount }, // Field ini ada di Promotion
                    // Jika semua post sudah PAID, update status Promotion ke COMPLETED?
                }
            });
            return newTransaction;
          });
          console.log(`[payout-processor] Successfully processed payout of IDR ${payoutAmount} for post ${post.id}. Tx ID: ${transactionResult.id}`);

        } catch (txError: any) {
          console.error(`[payout-processor] Transaction error for post ${post.id} (Amount: ${payoutAmount}): ${txError.message}`, txError.stack);
          // Kembalikan status agar bisa dicoba lagi atau diinvestigasi
           await prisma.promotionPost.update({
                where: { id: post.id },
                data: { status: 'PAYOUT_ERROR_TX', errorMessage: txError.message.substring(0,255) }
            });
        }
      }
      console.log(`[payout-processor] Finished processing batch of payouts.`);

    } catch (error: any) {
      console.error(`[payout-processor] Error during scheduled execution: ${error.message}`, error.stack);
    }
  },
};
