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
  CampaignAnalytics
} from '@prisma/client'

// Define enum-like constants for SQLite compatibility
export const UserRole = {
  CREATOR: 'CREATOR',
  PROMOTER: 'PROMOTER',
  ADMIN: 'ADMIN'
} as const

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED'
} as const

export const CampaignStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

export const PromotionPlatform = {
  TIKTOK: 'TIKTOK',
  INSTAGRAM: 'INSTAGRAM',
  YOUTUBE: 'YOUTUBE',
  TWITTER: 'TWITTER',
  FACEBOOK: 'FACEBOOK'
} as const

export const PromotionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
} as const

export const TransactionType = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  EARNING: 'EARNING',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
  FEE: 'FEE'
} as const

export const TransactionReferenceType = {
  CAMPAIGN: 'CAMPAIGN',
  PROMOTION: 'PROMOTION',
  WITHDRAWAL_REQUEST: 'WITHDRAWAL_REQUEST'
} as const

export const TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
} as const

export const WithdrawalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
} as const

export const ReportContentType = {
  CAMPAIGN: 'CAMPAIGN',
  PROMOTION: 'PROMOTION',
  USER_PROFILE: 'USER_PROFILE'
} as const

export const ReportReason = {
  SPAM: 'SPAM',
  FRAUD: 'FRAUD',
  INAPPROPRIATE_CONTENT: 'INAPPROPRIATE_CONTENT',
  FAKE_METRICS: 'FAKE_METRICS',
  OTHER: 'OTHER'
} as const

export const ReportStatus = {
  PENDING: 'PENDING',
  INVESTIGATING: 'INVESTIGATING',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED'
} as const

// Export types for the constants
export type UserRole = typeof UserRole[keyof typeof UserRole]
export type UserStatus = typeof UserStatus[keyof typeof UserStatus]
export type CampaignStatus = typeof CampaignStatus[keyof typeof CampaignStatus]
export type PromotionPlatform = typeof PromotionPlatform[keyof typeof PromotionPlatform]
export type PromotionStatus = typeof PromotionStatus[keyof typeof PromotionStatus]
export type TransactionType = typeof TransactionType[keyof typeof TransactionType]
export type TransactionReferenceType = typeof TransactionReferenceType[keyof typeof TransactionReferenceType]
export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus]
export type WithdrawalStatus = typeof WithdrawalStatus[keyof typeof WithdrawalStatus]
export type ReportContentType = typeof ReportContentType[keyof typeof ReportContentType]
export type ReportReason = typeof ReportReason[keyof typeof ReportReason]
export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus]
