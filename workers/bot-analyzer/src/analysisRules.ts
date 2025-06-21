import { PlatformMetricSnapshot, BotThreshold, SocialPlatform, Prisma } from '@prisma/client'; // Tambahkan Prisma

export interface AnalysisResult {
  status: 'NORMAL' | 'SUSPICIOUS' | 'BOT_LIKELY' | 'INSUFFICIENT_DATA';
  reason: string;
  score?: number;
  details?: Prisma.JsonValue; // Menggunakan Prisma.JsonValue untuk tipe data JSON
}

export interface CalculatedPostMetrics {
  postId: string;
  platform: SocialPlatform;
  totalSnapshots: number;
  latestSnapshot?: PlatformMetricSnapshot;
  firstSnapshot?: PlatformMetricSnapshot;
  durationDays?: number;
  averageDailyViewIncrease?: number;
  averageDailyLikeIncrease?: number;
  averageDailyCommentIncrease?: number;
  peakViewIncrease?: { amount: bigint, periodHours: number, start: Date, end: Date };
  likeToViewRatio?: number;
  commentToViewRatio?: number;
  rawDataPoints?: { views: number[], likes: number[], comments: number[], timestamps: Date[] }; // Untuk analisis spike
}

export function calculateDerivedMetrics(
  postId: string,
  platform: SocialPlatform,
  snapshots: PlatformMetricSnapshot[]
): CalculatedPostMetrics {
  snapshots.sort((a, b) => a.fetchedAt.getTime() - b.fetchedAt.getTime());

  const result: CalculatedPostMetrics = {
    postId,
    platform,
    totalSnapshots: snapshots.length,
  };

  if (snapshots.length === 0) {
    return result;
  }

  result.firstSnapshot = snapshots[0];
  result.latestSnapshot = snapshots[snapshots.length - 1];

  result.rawDataPoints = { views: [], likes: [], comments: [], timestamps: [] };
  snapshots.forEach(s => {
    result.rawDataPoints?.views.push(Number(s.views || 0));
    result.rawDataPoints?.likes.push(Number(s.likes || 0));
    result.rawDataPoints?.comments.push(Number(s.comments || 0));
    result.rawDataPoints?.timestamps.push(s.fetchedAt);
  });


  if (result.latestSnapshot?.views && Number(result.latestSnapshot.views) > 0) {
    result.likeToViewRatio = (Number(result.latestSnapshot.likes || 0) / Number(result.latestSnapshot.views));
    result.commentToViewRatio = (Number(result.latestSnapshot.comments || 0) / Number(result.latestSnapshot.views));
  }

  if (snapshots.length >= 2) {
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    const durationMillis = last.fetchedAt.getTime() - first.fetchedAt.getTime();

    if (durationMillis > 0) { // Hindari pembagian dengan nol jika snapshot terlalu dekat
        const durationDays = Math.max(durationMillis / (1000 * 60 * 60 * 24), 1/24); // Minimal 1 jam dalam satuan hari
        result.durationDays = durationDays;

        result.averageDailyViewIncrease = Number(BigInt(last.views || 0) - BigInt(first.views || 0)) / durationDays;
        result.averageDailyLikeIncrease = Number(BigInt(last.likes || 0) - BigInt(first.likes || 0)) / durationDays;
        result.averageDailyCommentIncrease = Number(BigInt(last.comments || 0) - BigInt(first.comments || 0)) / durationDays;

        // Placeholder untuk peak view increase (perlu iterasi lebih detail)
        let maxIncrease = BigInt(0);
        let peakPeriodHours = 0;
        let peakStart = first.fetchedAt;
        let peakEnd = last.fetchedAt;

        for (let i = 0; i < snapshots.length -1; i++) {
            for (let j = i + 1; j < snapshots.length; j++) {
                const s1 = snapshots[i];
                const s2 = snapshots[j];
                const currentIncrease = BigInt(s2.views || 0) - BigInt(s1.views || 0);
                if (currentIncrease > maxIncrease) {
                    maxIncrease = currentIncrease;
                    peakPeriodHours = (s2.fetchedAt.getTime() - s1.fetchedAt.getTime()) / (1000*60*60);
                    peakStart = s1.fetchedAt;
                    peakEnd = s2.fetchedAt;
                }
            }
        }
        if (maxIncrease > 0 && peakPeriodHours > 0) {
             result.peakViewIncrease = { amount: maxIncrease, periodHours: parseFloat(peakPeriodHours.toFixed(2)), start: peakStart, end: peakEnd };
        }
    }
  }

  // console.log(`[analysisRules.ts] Calculated derived metrics for ${postId}:`, JSON.stringify(result, (key,value) => typeof value === 'bigint' ? value.toString() : value));
  return result;
}

export function applyBotDetectionRules(
  calculatedMetrics: CalculatedPostMetrics,
  thresholds: BotThreshold[]
): AnalysisResult {
  if (calculatedMetrics.totalSnapshots < 2 && !calculatedMetrics.latestSnapshot) {
    return { status: 'INSUFFICIENT_DATA', reason: 'Not enough metric snapshots for analysis.' };
  }

  let suspicionScore = 0;
  let reasons: string[] = [];
  const details: Record<string, any> = {};

  // Aturan 1: Rasio Like/View
  const ltvThreshold = thresholds.find(t =>
    (!t.platform || t.platform === calculatedMetrics.platform) && t.metricType === 'LIKE_VIEW_RATIO' && t.isActive
  );
  if (calculatedMetrics.likeToViewRatio !== undefined) {
    details['likeToViewRatio'] = calculatedMetrics.likeToViewRatio;
    if (ltvThreshold?.upperBound && calculatedMetrics.likeToViewRatio > ltvThreshold.upperBound) {
      suspicionScore += 0.3; // Bobot bisa disesuaikan
      reasons.push(`High Like/View ratio: ${(calculatedMetrics.likeToViewRatio * 100).toFixed(1)}% (Threshold < ${(ltvThreshold.upperBound * 100).toFixed(1)}%)`);
      details['ltvThresholdBreach'] = `Value: ${(calculatedMetrics.likeToViewRatio * 100).toFixed(1)}%, Threshold: < ${(ltvThreshold.upperBound * 100).toFixed(1)}%`;
    } else if (ltvThreshold?.lowerBound && calculatedMetrics.likeToViewRatio < ltvThreshold.lowerBound) {
      suspicionScore += 0.2;
      reasons.push(`Low Like/View ratio: ${(calculatedMetrics.likeToViewRatio * 100).toFixed(1)}% (Threshold > ${(ltvThreshold.lowerBound * 100).toFixed(1)}%)`);
       details['ltvThresholdBreach'] = `Value: ${(calculatedMetrics.likeToViewRatio * 100).toFixed(1)}%, Threshold: > ${(ltvThreshold.lowerBound * 100).toFixed(1)}%`;
    }
  }

  // Aturan 2: Peningkatan Views Harian
  const dailyViewThreshold = thresholds.find(t =>
    (!t.platform || t.platform === calculatedMetrics.platform) && t.metricType === 'DAILY_VIEW_INCREASE' && t.isActive
  );
  if (calculatedMetrics.averageDailyViewIncrease !== undefined) {
    details['averageDailyViewIncrease'] = calculatedMetrics.averageDailyViewIncrease;
    if (dailyViewThreshold?.upperBound && calculatedMetrics.averageDailyViewIncrease > dailyViewThreshold.upperBound) {
      suspicionScore += 0.5;
      reasons.push(`High daily view increase: ${calculatedMetrics.averageDailyViewIncrease.toFixed(0)}/day (Threshold < ${dailyViewThreshold.upperBound.toFixed(0)}/day)`);
      details['dailyViewThresholdBreach'] = `Value: ${calculatedMetrics.averageDailyViewIncrease.toFixed(0)}, Threshold: < ${dailyViewThreshold.upperBound.toFixed(0)}`;
    }
    // Bisa juga ada threshold mean dan stdDev untuk ini
    if (dailyViewThreshold?.mean !== null && dailyViewThreshold?.stdDev !== null && dailyViewThreshold?.levelAMultiplier !== null &&
        calculatedMetrics.averageDailyViewIncrease > (dailyViewThreshold.mean! + dailyViewThreshold.levelAMultiplier! * dailyViewThreshold.stdDev!)
    ) {
        suspicionScore += 0.5; // Tambah atau ganti skor sebelumnya
        reasons.push(`Daily view increase significantly above normal distribution.`);
        details['dailyViewDistributionBreach'] = `Value: ${calculatedMetrics.averageDailyViewIncrease.toFixed(0)}, Mean: ${dailyViewThreshold.mean}, StdDev: ${dailyViewThreshold.stdDev}`;
    }
  }

  // Aturan 3: Deteksi Lonjakan (Spike) - contoh sangat sederhana
  // Ini perlu algoritma yang lebih baik, misal Z-score pada delta, atau analisis window.
  if (calculatedMetrics.rawDataPoints && calculatedMetrics.rawDataPoints.views.length > 5) {
      const views = calculatedMetrics.rawDataPoints.views;
      const deltas = [];
      for (let i = 1; i < views.length; i++) {
          deltas.push(views[i] - views[i-1]);
      }
      const meanDelta = deltas.reduce((a,b) => a+b, 0) / deltas.length;
      const stdDevDelta = Math.sqrt(deltas.map(x => Math.pow(x - meanDelta, 2)).reduce((a,b) => a+b,0) / deltas.length);
      details['viewIncreaseMeanDelta'] = meanDelta;
      details['viewIncreaseStdDevDelta'] = stdDevDelta;

      if (stdDevDelta > 0) { // Hindari pembagian dengan nol
          for (const delta of deltas) {
              if (delta > 0 && (delta - meanDelta) / stdDevDelta > 3.5) { // Lonjakan > 3.5 std dev dari rata2 peningkatan
                  suspicionScore += 0.4;
                  reasons.push(`Significant view spike detected (delta: ${delta}, mean_delta: ${meanDelta.toFixed(0)}, std_dev_delta: ${stdDevDelta.toFixed(0)}).`);
                  details['spikeDetected'] = `Delta: ${delta}, Z-score: ${((delta - meanDelta) / stdDevDelta).toFixed(1)}`;
                  break;
              }
          }
      }
  }


  let finalStatus: AnalysisResult['status'] = 'NORMAL';
  if (suspicionScore >= 0.7) { // Sesuaikan batas skor ini
    finalStatus = 'BOT_LIKELY';
  } else if (suspicionScore >= 0.3) {
    finalStatus = 'SUSPICIOUS';
  }

  if (reasons.length === 0 && calculatedMetrics.totalSnapshots > 0) {
     reasons.push("No suspicious patterns detected based on current rules.");
  } else if (reasons.length === 0 && finalStatus === 'NORMAL') {
     reasons.push("Analyzed, appears normal.");
  }


  return { status: finalStatus, reason: reasons.join('; '), score: parseFloat(suspicionScore.toFixed(2)), details: details as Prisma.JsonObject };
}
