import { z } from 'zod'
import { VALIDATION_CONSTANTS, BUSINESS_CONSTANTS } from '../constants'

// User validations
export const userRegistrationSchema = z.object({
  name: z.string()
    .min(VALIDATION_CONSTANTS.MIN_NAME_LENGTH, 'Name must be at least 2 characters')
    .max(VALIDATION_CONSTANTS.MAX_NAME_LENGTH, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH, 'Password must be at least 8 characters')
    .max(VALIDATION_CONSTANTS.MAX_PASSWORD_LENGTH, 'Password must be less than 128 characters'),
  role: z.enum(['CREATOR', 'PROMOTER']),
  phone: z.string().optional(),
  bio: z.string()
    .max(VALIDATION_CONSTANTS.MAX_BIO_LENGTH, 'Bio must be less than 500 characters')
    .optional(),
})

export const userUpdateSchema = z.object({
  name: z.string()
    .min(VALIDATION_CONSTANTS.MIN_NAME_LENGTH)
    .max(VALIDATION_CONSTANTS.MAX_NAME_LENGTH)
    .optional(),
  phone: z.string().optional(),
  bio: z.string()
    .max(VALIDATION_CONSTANTS.MAX_BIO_LENGTH)
    .optional(),
  socialLinks: z.record(z.string().url()).optional(),
})

// Campaign validations
export const campaignRequirementSchema = z.object({
  platform: z.string(),
  minFollowers: z.number().min(0).optional(),
  minEngagementRate: z.number().min(0).max(100).optional(),
  contentType: z.array(z.string()),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  description: z.string()
    .min(VALIDATION_CONSTANTS.MIN_DESCRIPTION_LENGTH)
    .max(VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH),
})

export const campaignMaterialSchema = z.object({
  type: z.enum(['image', 'video', 'text', 'link']),
  url: z.string().url().optional(),
  content: z.string().optional(),
  description: z.string()
    .min(VALIDATION_CONSTANTS.MIN_DESCRIPTION_LENGTH)
    .max(VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH),
})

const baseCampaignSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH, 'Title must be less than 200 characters'),
  description: z.string()
    .min(VALIDATION_CONSTANTS.MIN_DESCRIPTION_LENGTH, 'Description must be at least 10 characters')
    .max(VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH, 'Description must be less than 1000 characters'),
  budgetUsd: z.number()
    .min(BUSINESS_CONSTANTS.MINIMUM_CAMPAIGN_BUDGET, `Budget must be at least $${BUSINESS_CONSTANTS.MINIMUM_CAMPAIGN_BUDGET}`)
    .max(BUSINESS_CONSTANTS.MAXIMUM_CAMPAIGN_BUDGET, `Budget must be less than $${BUSINESS_CONSTANTS.MAXIMUM_CAMPAIGN_BUDGET}`),
  ratePerViewerUsd: z.number()
    .min(0.01, 'Rate per viewer must be at least $0.01')
    .max(1, 'Rate per viewer must be less than $1'),
  targetViewers: z.number()
    .min(BUSINESS_CONSTANTS.MINIMUM_TARGET_VIEWERS, `Target viewers must be at least ${BUSINESS_CONSTANTS.MINIMUM_TARGET_VIEWERS}`)
    .max(BUSINESS_CONSTANTS.MAXIMUM_TARGET_VIEWERS, `Target viewers must be less than ${BUSINESS_CONSTANTS.MAXIMUM_TARGET_VIEWERS}`),
  requirements: z.array(campaignRequirementSchema).min(1, 'At least one requirement is needed'),
  materials: z.array(campaignMaterialSchema).min(1, 'At least one material is needed'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export const createCampaignSchema = baseCampaignSchema.refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
}).refine(data => data.budgetUsd >= data.ratePerViewerUsd * data.targetViewers, {
  message: 'Budget must be sufficient for target viewers',
  path: ['budgetUsd'],
})

export const updateCampaignSchema = baseCampaignSchema.partial()

// Promotion validations
export const socialMediaMetricsSchema = z.object({
  views: z.number().min(0),
  likes: z.number().min(0),
  comments: z.number().min(0),
  shares: z.number().min(0),
  saves: z.number().min(0).optional(),
  engagementRate: z.number().min(0).max(100),
})

export const createPromotionSchema = z.object({
  campaignId: z.string().uuid(),
  platform: z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'FACEBOOK']),
  contentUrl: z.string().url('Invalid content URL'),
  estimatedReach: z.number().min(1, 'Estimated reach must be at least 1'),
})

export const submitPromotionProofSchema = z.object({
  proofUrl: z.string().url('Invalid proof URL'),
  metrics: socialMediaMetricsSchema,
})

// Transaction validations
export const createTransactionSchema = z.object({
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'EARNING', 'PAYMENT', 'REFUND', 'FEE']),
  amountIdr: z.number().min(0, 'Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  paymentMethod: z.string().optional(),
  paymentData: z.record(z.any()).optional(),
})

// Withdrawal validations
export const withdrawalRequestSchema = z.object({
  amountIdr: z.number()
    .min(BUSINESS_CONSTANTS.WITHDRAWAL_MINIMUM_AMOUNT, `Minimum withdrawal is Rp ${BUSINESS_CONSTANTS.WITHDRAWAL_MINIMUM_AMOUNT.toLocaleString()}`)
    .max(BUSINESS_CONSTANTS.WITHDRAWAL_MAXIMUM_AMOUNT, `Maximum withdrawal is Rp ${BUSINESS_CONSTANTS.WITHDRAWAL_MAXIMUM_AMOUNT.toLocaleString()}`),
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string()
    .min(8, 'Account number must be at least 8 digits')
    .max(20, 'Account number must be less than 20 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  accountName: z.string()
    .min(2, 'Account name must be at least 2 characters')
    .max(100, 'Account name must be less than 100 characters'),
})

// Report validations
export const createReportSchema = z.object({
  reportedUserId: z.string().uuid(),
  reportedContentId: z.string().uuid().optional(),
  reportedContentType: z.enum(['CAMPAIGN', 'PROMOTION', 'USER_PROFILE']).optional(),
  reason: z.enum(['SPAM', 'FRAUD', 'INAPPROPRIATE_CONTENT', 'FAKE_METRICS', 'OTHER']),
  description: z.string()
    .min(VALIDATION_CONSTANTS.MIN_DESCRIPTION_LENGTH, 'Description must be at least 10 characters')
    .max(VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH, 'Description must be less than 1000 characters'),
  evidenceUrls: z.array(z.string().url()).optional(),
})

// Search and filter validations
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export const campaignFiltersSchema = z.object({
  status: z.array(z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'])).optional(),
  platform: z.array(z.string()).optional(),
  minBudget: z.number().min(0).optional(),
  maxBudget: z.number().min(0).optional(),
  minRate: z.number().min(0).optional(),
  maxRate: z.number().min(0).optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
}).merge(paginationSchema)

export const promotionFiltersSchema = z.object({
  status: z.array(z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'])).optional(),
  platform: z.array(z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'FACEBOOK'])).optional(),
  campaignId: z.string().uuid().optional(),
  submittedAfter: z.string().datetime().optional(),
  submittedBefore: z.string().datetime().optional(),
}).merge(paginationSchema)

// File upload validations
export const fileUploadSchema = z.object({
  file: z.any().refine(
    (file) => file instanceof File,
    'File is required'
  ).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'File size must be less than 10MB'
  ),
  type: z.enum(['avatar', 'campaign_material', 'promotion_proof', 'report_evidence']),
})

// Admin validations
export const adminUserUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']).optional(),
  role: z.enum(['CREATOR', 'PROMOTER', 'ADMIN']).optional(),
  balanceIdr: z.number().min(0).optional(),
})

export const adminWithdrawalActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().optional(),
})

export const adminReportActionSchema = z.object({
  action: z.enum(['RESOLVE', 'DISMISS']),
  resolutionNotes: z.string().min(1, 'Resolution notes are required'),
})

// Type exports for TypeScript
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
export type CreatePromotionInput = z.infer<typeof createPromotionSchema>
export type SubmitPromotionProofInput = z.infer<typeof submitPromotionProofSchema>
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>
export type CreateReportInput = z.infer<typeof createReportSchema>
export type CampaignFiltersInput = z.infer<typeof campaignFiltersSchema>
export type PromotionFiltersInput = z.infer<typeof promotionFiltersSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>
export type AdminWithdrawalActionInput = z.infer<typeof adminWithdrawalActionSchema>
export type AdminReportActionInput = z.infer<typeof adminReportActionSchema>
