import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, SocialPlatform, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const submitPostSchema = z.object({
  promotionId: z.string().cuid({ message: "Invalid Promotion ID format" }),
  postUrl: z.string().url({ message: "Invalid URL format" }),
});

function detectPlatformFromUrl(url: string): SocialPlatform | null {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes("tiktok.com")) return SocialPlatform.TIKTOK;
    if (hostname.includes("instagram.com")) return SocialPlatform.INSTAGRAM;
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return SocialPlatform.YOUTUBE;
  } catch (e) {
    // Invalid URL, akan ditangani oleh Zod validation
    return null;
  }
  return null;
}

function extractPostIdFromUrl(url: string, platform: SocialPlatform): string | undefined {
    try {
        const urlObj = new URL(url);
        let postId;
        const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);

        if (platform === SocialPlatform.TIKTOK) {
            // https://www.tiktok.com/@username/video/VIDEO_ID
            // atau https://vm.tiktok.com/SHORT_CODE/
            if (urlObj.hostname === "vm.tiktok.com" || urlObj.hostname === "vt.tiktok.com") {
                 // Untuk URL pendek, ID-nya adalah path terakhir, tapi ini bukan ID video permanen.
                 // Sebaiknya dapatkan URL final setelah redirect jika memungkinkan, atau minta ID video.
                 // Untuk sekarang, kita ambil saja kode pendeknya.
                postId = pathSegments.pop();
            } else {
                const videoSegmentIndex = pathSegments.indexOf('video');
                if (videoSegmentIndex !== -1 && videoSegmentIndex + 1 < pathSegments.length) {
                    postId = pathSegments[videoSegmentIndex + 1];
                    // Hapus query params dari post ID jika ada
                    if (postId?.includes('?')) {
                        postId = postId.split('?')[0];
                    }
                }
            }
        } else if (platform === SocialPlatform.INSTAGRAM) {
            // https://www.instagram.com/p/POST_ID/
            // https://www.instagram.com/reels/POST_ID/ (atau /reel/)
            if ((pathSegments[0] === 'p' || pathSegments[0] === 'reels' || pathSegments[0] === 'reel') && pathSegments.length > 1) {
                postId = pathSegments[1];
            }
        } else if (platform === SocialPlatform.YOUTUBE) {
            // https://www.youtube.com/watch?v=VIDEO_ID
            // https://youtu.be/VIDEO_ID
            // https://www.youtube.com/shorts/VIDEO_ID
            if (urlObj.hostname === 'youtu.be') {
                postId = pathSegments[0];
            } else if (pathSegments[0] === 'shorts' && pathSegments.length > 1) {
                postId = pathSegments[1];
            } else {
                postId = urlObj.searchParams.get('v');
            }
        }
        return postId || undefined;
    } catch (e) {
        console.error(`Error extracting post ID for ${platform} from ${url}:`, e);
        return undefined;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // === AUTHENTICATION PLACEHOLDER ===
  // TODO: Replace with actual session validation from `better-auth`
  // const session = await getBetterAuthServerSession(req, res); // Implement this
  // if (!session || !session.user || !session.user.id || session.user.role !== 'PROMOTER') {
  //   return res.status(401).json({ message: 'Unauthorized or not a Promoter' });
  // }
  // const promoterId = session.user.id;

  // Temporary auth bypass for development - REMOVE FOR PRODUCTION
  const promoterIdFromHeader = req.headers['x-promoter-id'] as string;
  if (!promoterIdFromHeader) {
    // Fallback to query param if header not present (for simpler testing)
    const promoterIdFromQuery = req.query.promoterId as string;
    if (!promoterIdFromQuery) {
        console.warn("WARN: No x-promoter-id header or promoterId query param. API will likely fail promoter check.");
        return res.status(401).json({ message: 'Unauthorized: Missing x-promoter-id header or promoterId query param for testing.' });
    }
    (global as any).promoterIdForTesting = promoterIdFromQuery; // Use global for simplicity in this placeholder
    console.warn(`WARN: Using promoterId from query param: ${promoterIdFromQuery}`);
  } else {
    (global as any).promoterIdForTesting = promoterIdFromHeader;
    console.warn(`WARN: Using promoterId from x-promoter-id header: ${promoterIdFromHeader}`);
  }
  const promoterId = (global as any).promoterIdForTesting;
  // === END AUTHENTICATION PLACEHOLDER ===

  try {
    const validatedData = submitPostSchema.parse(req.body);
    const { promotionId, postUrl } = validatedData;

    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found.' });
    }
    if (promotion.promoterId !== promoterId) {
      return res.status(403).json({ message: 'You are not authorized for this promotion.' });
    }
    // Allow submission even if status is not PENDING, for re-submission or late submission cases.
    // if (promotion.status !== 'PENDING' && promotion.status !== 'AWAITING_METRICS') {
    //   return res.status(400).json({ message: `Promotion is not in a submittable state (current: ${promotion.status})` });
    // }

    const platform = detectPlatformFromUrl(postUrl);
    if (!platform) {
      return res.status(400).json({ message: 'Could not detect platform from URL. Supported: TikTok, Instagram, YouTube.' });
    }

    const externalPostId = extractPostIdFromUrl(postUrl, platform);

    // Check for duplicate postUrl within the same promotion
    const existingPostForThisPromotion = await prisma.promotionPost.findFirst({
        where: {
            promotionId: promotionId,
            postUrl: postUrl,
        }
    });

    if (existingPostForThisPromotion) {
        return res.status(400).json({ message: 'This post URL has already been submitted for this specific promotion.' });
    }

    const newPromotionPost = await prisma.promotionPost.create({
      data: {
        promotionId: promotionId,
        platform: platform,
        postUrl: postUrl,
        externalPostId: externalPostId,
        submittedAt: new Date(),
        fetchStatus: 'PENDING_FETCH',
        botAnalysisStatus: 'NOT_ANALYZED',
        // nextCheckAt: new Date(Date.now() + 5 * 60 * 1000), // Optional: schedule first check in 5 mins
      },
    });

    if (promotion.status === 'PENDING') {
      await prisma.promotion.update({
        where: { id: promotionId },
        data: { status: 'AWAITING_METRICS' },
      });
    }

    res.status(201).json({ message: 'Promotion post submitted successfully.', promotionPost: newPromotionPost });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', errors: error.errors });
    }
    console.error("Error submitting promotion post:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002 is unique constraint violation
        if (error.code === 'P2002' && error.meta?.target?.includes('postUrl')) {
            // This specific check might be tricky if postUrl is globally unique but we want to allow it
            // if it's for a *different* promotion. The current logic handles unique per promotion.
            // If postUrl is globally unique in DB, this error will be caught.
             return res.status(400).json({ message: 'This post URL might already exist in the system under a different context.' });
        }
    }
    res.status(500).json({ message: 'Internal Server Error', details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
