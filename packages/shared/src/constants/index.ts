// Business constants
export const BUSINESS_CONSTANTS = {
  DEFAULT_CAMPAIGN_BUDGET_USD: 1000,
  RATE_PER_VIEWER_USD: 0.1,
  PLATFORM_FEE_PERCENTAGE: 10,
  MINIMUM_PAYOUT_IDR: 50000,
  USD_TO_IDR_RATE: 15000, // This should be fetched from API in production
  
  // Withdrawal settings
  WITHDRAWAL_ADMIN_FEE_PERCENTAGE: 2.5,
  WITHDRAWAL_MINIMUM_AMOUNT: 50000,
  WITHDRAWAL_MAXIMUM_AMOUNT: 10000000,
  
  // Campaign settings
  MINIMUM_CAMPAIGN_BUDGET: 100,
  MAXIMUM_CAMPAIGN_BUDGET: 10000,
  MINIMUM_TARGET_VIEWERS: 100,
  MAXIMUM_TARGET_VIEWERS: 1000000,
  
  // Rate limits
  MAX_CAMPAIGNS_PER_USER: 10,
  MAX_PROMOTIONS_PER_CAMPAIGN: 100,
  MAX_ACTIVE_CAMPAIGNS: 5,
} as const

// Platform constants
export const SOCIAL_PLATFORMS = {
  TIKTOK: {
    name: 'TikTok',
    icon: 'tiktok',
    color: '#000000',
    minFollowers: 1000,
    trackingSupported: true,
  },
  INSTAGRAM: {
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    minFollowers: 1000,
    trackingSupported: true,
  },
  YOUTUBE: {
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    minFollowers: 1000,
    trackingSupported: true,
  },
  TWITTER: {
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    minFollowers: 500,
    trackingSupported: false,
  },
  FACEBOOK: {
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    minFollowers: 1000,
    trackingSupported: false,
  },
} as const

// Content types
export const CONTENT_TYPES = {
  POST: 'Post',
  STORY: 'Story',
  REEL: 'Reel',
  VIDEO: 'Video',
  LIVE: 'Live Stream',
  CAROUSEL: 'Carousel',
} as const

// User roles and permissions
export const USER_ROLES = {
  CREATOR: {
    name: 'Content Creator',
    permissions: ['create_campaign', 'manage_campaign', 'view_analytics'],
  },
  PROMOTER: {
    name: 'Promoter',
    permissions: ['join_campaign', 'submit_promotion', 'view_earnings'],
  },
  ADMIN: {
    name: 'Administrator',
    permissions: ['manage_users', 'manage_campaigns', 'manage_payments', 'view_reports'],
  },
} as const

// Status colors for UI
export const STATUS_COLORS = {
  // Campaign statuses
  DRAFT: 'gray',
  ACTIVE: 'green',
  PAUSED: 'yellow',
  COMPLETED: 'blue',
  CANCELLED: 'red',
  
  // Promotion statuses
  PENDING: 'yellow',
  APPROVED: 'green',
  REJECTED: 'red',
  
  // Transaction statuses
  COMPLETED: 'green',
  FAILED: 'red',
  
  // User statuses
  SUSPENDED: 'yellow',
  BANNED: 'red',
} as const

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  CAMPAIGNS: '/api/campaigns',
  PROMOTIONS: '/api/promotions',
  TRANSACTIONS: '/api/transactions',
  WITHDRAWALS: '/api/withdrawals',
  REPORTS: '/api/reports',
  ANALYTICS: '/api/analytics',
  UPLOAD: '/api/upload',
} as const

// File upload constants
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain'],
} as const

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const

// Validation constants
export const VALIDATION_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_TITLE_LENGTH: 200,
  MAX_BIO_LENGTH: 500,
} as const
