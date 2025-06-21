import { Env } from '../index';

export interface YouTubeMetrics {
  views: bigint | null;
  likes: bigint | null;
  comments: bigint | null;
  shares: bigint | null; // YouTube API tidak menyediakan 'shares' secara langsung di statistik video
  rawData?: Record<string, any> | null;
}

export async function fetchYouTubeMetrics(
  postUrl: string,
  externalPostId: string | null | undefined, // YouTube Video ID
  accessToken: string | null, // User OAuth Access Token (opsional jika video publik & pakai API Key)
  apiKey: string | null,      // API Key (jika dikonfigurasi di Env dan video publik)
  env: Env
): Promise<YouTubeMetrics | null> {
  console.log(`[youtube.ts] Attempting to fetch YouTube metrics for URL: ${postUrl} (Video ID: ${externalPostId || 'N/A'})`);

  // TODO: Implementasi Panggilan API YouTube Data API v3 Sebenarnya
  // 1. Ekstrak Video ID dari `postUrl` jika `externalPostId` tidak ada.
  //    Contoh URL: https://www.youtube.com/watch?v=VIDEO_ID , https://youtu.be/VIDEO_ID, https://www.youtube.com/shorts/VIDEO_ID
  // 2. Bangun URL API: `https://www.googleapis.com/youtube/v3/videos?part=statistics&id={VIDEO_ID}&key={API_KEY}`
  //    Jika menggunakan OAuth: Ganti `&key={API_KEY}` dengan header `Authorization: Bearer ${accessToken}`.
  //    API Key lebih mudah untuk data video publik. OAuth diperlukan untuk data video milik pengguna yang terotentikasi (misalnya, unlisted).
  // 3. Lakukan panggilan HTTP GET.
  // 4. Parse respons JSON. Statistik ada di `items[0].statistics`.
  //    `viewCount`, `likeCount`, `commentCount` (semua biasanya string, perlu konversi ke BigInt).
  //    `favoriteCount` sudah deprecated. `dislikeCount` tidak lagi publik.
  // 5. Tangani error: kuota habis, video tidak ditemukan, API key tidak valid, dll.

  // --- PLACEHOLDER IMPLEMENTATION ---
  let videoId = externalPostId;
  if (!videoId) {
    try {
        const urlObj = new URL(postUrl);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.substring(1).split('?')[0];
        } else if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.pathname.startsWith('/shorts/')) {
                videoId = urlObj.pathname.split('/shorts/')[1].split('?')[0];
            } else {
                const vParam = urlObj.searchParams.get('v');
                if (vParam) videoId = vParam.split('&')[0];
            }
        }
    } catch(e) { /* ignore parsing error */ }

    if (!videoId) {
        console.warn(`[youtube.ts] Cannot fetch metrics: Video ID is missing and could not be extracted from URL: ${postUrl}`);
        return { views: null, likes: null, comments: null, shares: null, rawData: { error: "Missing YouTube Video ID" } };
    }
    console.log(`[youtube.ts] Used extracted Video ID for YouTube: ${videoId}`);
  }

  const authDetail = accessToken ? `OAuth (token: ${accessToken.substring(0,10)}...)` : (apiKey ? `API Key (key: ${apiKey.substring(0,5)}...)` : "No auth method provided");
  console.log(`[youtube.ts] SIMULATING API call for YouTube video: ${videoId} using ${authDetail}`);
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

  const isErrorSimulation = Math.random() < 0.05;
  if (isErrorSimulation) {
    console.error(`[youtube.ts] SIMULATED API Error for ${videoId}`);
    throw new Error("Simulated YouTube API Error: Video not found or API quota exceeded.");
  }

  const dummyViews = BigInt(Math.floor(Math.random() * 2500000) + 500);
  const dummyLikes = BigInt(Math.floor(Number(dummyViews) / (Math.random() * 60 + 20)) + Math.floor(Math.random() * 150));
  const dummyComments = BigInt(Math.floor(Number(dummyLikes) / (Math.random() * 70 + 25)) + Math.floor(Math.random() * 80));

  const simulatedRawData = {
    kind: "youtube#videoListResponse",
    items: [
      {
        kind: "youtube#video",
        id: videoId,
        statistics: {
          viewCount: String(dummyViews),
          likeCount: String(dummyLikes),
          commentCount: String(dummyComments),
        },
      },
    ],
    retrieved_at: new Date().toISOString(),
  };

  console.log(`[youtube.ts] SIMULATED metrics for ${videoId}: V:${dummyViews}, L:${dummyLikes}, C:${dummyComments}`);

  return {
    views: dummyViews,
    likes: dummyLikes,
    comments: dummyComments,
    shares: null, // Shares tidak tersedia secara langsung
    rawData: simulatedRawData,
  };
  // --- END PLACEHOLDER ---
}
