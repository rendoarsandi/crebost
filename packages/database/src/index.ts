import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

export { prisma }
export * from '@prisma/client'

// Re-export types for convenience
export type {
  User,
  Campaign,
  Promotion,
  Transaction,
  WithdrawalRequest,
  Report,
  AnalyticsEvent,
  CampaignAnalytics,
  UserRole,
  UserStatus,
  CampaignStatus,
  PromotionPlatform,
  PromotionStatus,
  TransactionType,
  TransactionReferenceType,
  TransactionStatus,
  WithdrawalStatus,
  ReportContentType,
  ReportReason,
  ReportStatus
} from '@prisma/client'
