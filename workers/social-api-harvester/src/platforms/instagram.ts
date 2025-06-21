import { Env } from '../index';

export interface InstagramMetrics {
  views: bigint | null; // Bisa jadi impressions, reach, atau video_views
  likes: bigint | null;
  comments: bigint | null;
  shares: bigint | null; // Di Instagram, ini biasanya 'saved'
  rawData?: Record<string, any> | null;
}

export async function fetchInstagramMetrics(
  postUrl: string,
  externalPostId: string | null | undefined, // Ini seharusnya IG Media ID (angka)
  accessToken: string, // User Access Token untuk Instagram Graph API
  env: Env
): Promise<InstagramMetrics | null> {
  console.log(`[instagram.ts] Attempting to fetch Instagram metrics for URL: ${postUrl} (Media ID: ${externalPostId || 'N/A'})`);

  // TODO: Implementasi Panggilan API Instagram Graph API Sebenarnya
  // 1. Validasi `externalPostId`. Jika tidak ada, coba ekstrak shortcode dari URL.
  //    PENTING: Shortcode (/p/ABCDE/) BUKAN IG Media ID. Anda mungkin perlu langkah tambahan
  //    untuk mendapatkan IG Media ID dari shortcode jika API tidak langsung menerimanya,
  //    atau minta promotor untuk menyediakan IG Media ID (lebih baik).
  //    Contoh endpoint untuk mendapatkan info dari shortcode (membutuhkan App Access Token atau User Token):
  //    `https://graph.facebook.com/vX.X/instagram_oembed?url={POST_URL}&access_token={ACCESS_TOKEN}` -> dapatkan media_id
  //    Atau jika sudah punya IG Media ID:
  // 2. Panggil Instagram Graph API: `https://graph.facebook.com/vX.X/{IG_MEDIA_ID}?fields=id,media_type,media_url,permalink,username,timestamp,caption,like_count,comments_count,thumbnail_url`
  //    Dan untuk insights (memerlukan izin `instagram_manage_insights`):
  //    `https://graph.facebook.com/vX.X/{IG_MEDIA_ID}/insights?metric=impressions,reach,saved` (untuk gambar/carousel)
  //    `https://graph.facebook.com/vX.X/{IG_MEDIA_ID}/insights?metric=impressions,reach,saved,video_views,total_interactions` (untuk video/Reels)
  //    Perhatikan bahwa `like_count` dan `comments_count` ada di field media utama, bukan di /insights.
  // 3. Parse respons JSON.
  // 4. Tangani error (izin, rate limit, akun bukan Bisnis/Kreator, dll.).

  // --- PLACEHOLDER IMPLEMENTATION ---
  let igMediaId = externalPostId;
  if (!igMediaId) {
    let shortcode;
    try {
        const urlObj = new URL(postUrl);
        const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
        if ((pathSegments[0] === 'p' || pathSegments[0] === 'reels' || pathSegments[0] === 'reel') && pathSegments.length > 1) {
            shortcode = pathSegments[1];
        }
    } catch(e) {/* ignore */}

    if (!shortcode) {
        console.warn(`[instagram.ts] Cannot fetch metrics: externalPostId (IG Media ID) is missing and shortcode could not be extracted from URL: ${postUrl}`);
        return { views: null, likes: null, comments: null, shares: null, rawData: { error: "Missing IG Media ID/shortcode" } };
    }
    console.log(`[instagram.ts] Extracted shortcode: ${shortcode}. In a real scenario, this shortcode would need to be converted to an IG Media ID via an API call if not already the ID.`);
    // Untuk simulasi, kita anggap shortcode ini bisa dipakai, padahal aslinya perlu IG Media ID numerik
    igMediaId = `simulated_media_id_for_${shortcode}`;
  }

  console.log(`[instagram.ts] SIMULATING API call for Instagram media: ${igMediaId} with token ${accessToken.substring(0,10)}...`);
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

  const isErrorSimulation = Math.random() < 0.1;
  if (isErrorSimulation) {
    console.error(`[instagram.ts] SIMULATED API Error for ${igMediaId}`);
    throw new Error("Simulated Instagram API Error: Cannot access insights for this media.");
  }

  // Data simulasi, gabungan dari field media utama dan /insights
  const dummyViews = BigInt(Math.floor(Math.random() * 75000) + 300); // Bisa impressions atau video_views
  const dummyLikes = BigInt(Math.floor(Number(dummyViews) / (Math.random() * 40 + 15)) + Math.floor(Math.random() * 70));
  const dummyComments = BigInt(Math.floor(Number(dummyLikes) / (Math.random() * 50 + 20)) + Math.floor(Math.random() * 30));
  const dummySaved = BigInt(Math.floor(Number(dummyLikes) / (Math.random() * 70 + 25)) + Math.floor(Math.random() * 15));

  const simulatedRawData = {
    id: igMediaId, // Seharusnya IG Media ID numerik
    media_type: Math.random() > 0.5 ? "IMAGE" : "VIDEO",
    like_count: Number(dummyLikes),
    comments_count: Number(dummyComments),
    insights: { // Contoh jika dari /insights
      data: [
        { name: "impressions", values: [{ value: Number(dummyViews) }] },
        { name: "saved", values: [{ value: Number(dummySaved) }] }
        // Jika video, mungkin ada { name: "video_views", values: [{ value: Number(dummyViews) }] }
      ],
    },
    retrieved_at: new Date().toISOString(),
  };

  console.log(`[instagram.ts] SIMULATED metrics for ${igMediaId}: V(Impressions):${dummyViews}, L:${dummyLikes}, C:${dummyComments}, S(Saved):${dummySaved}`);

  return {
    views: dummyViews,
    likes: dummyLikes,
    comments: dummyComments,
    shares: dummySaved,
    rawData: simulatedRawData,
  };
  // --- END PLACEHOLDER ---
}
