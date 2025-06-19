import { format, parseISO, isValid } from 'date-fns'
import { BUSINESS_CONSTANTS, DATE_FORMATS } from '../constants'

// Currency utilities
export const formatCurrency = (amount: number, currency: 'USD' | 'IDR' = 'IDR'): string => {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'IDR' ? 0 : 2,
  })
  return formatter.format(amount)
}

export const convertUsdToIdr = (usdAmount: number): number => {
  return Math.round(usdAmount * BUSINESS_CONSTANTS.USD_TO_IDR_RATE)
}

export const convertIdrToUsd = (idrAmount: number): number => {
  return Math.round((idrAmount / BUSINESS_CONSTANTS.USD_TO_IDR_RATE) * 100) / 100
}

// Date utilities
export const formatDate = (date: string | Date, formatType: keyof typeof DATE_FORMATS = 'DISPLAY'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Invalid Date'
    return format(dateObj, DATE_FORMATS[formatType])
  } catch {
    return 'Invalid Date'
  }
}

export const isDateInPast = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) && dateObj < new Date()
  } catch {
    return false
  }
}

export const isDateInFuture = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) && dateObj > new Date()
  } catch {
    return false
  }
}

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Number utilities
export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((value / total) * 100 * 100) / 100
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

// Array utilities
export const groupBy = <T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const group = key(item)
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array))
}

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// File utilities
export const getFileExtension = (filename: string): string => {
  return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase()
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Social media utilities
export const extractSocialMediaHandle = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    // Extract handle from various social media platforms
    if (urlObj.hostname.includes('tiktok.com')) {
      const match = pathname.match(/@([^/]+)/)
      return match ? match[1] : null
    }
    
    if (urlObj.hostname.includes('instagram.com')) {
      const match = pathname.match(/\/([^/]+)/)
      return match ? match[1] : null
    }
    
    if (urlObj.hostname.includes('youtube.com')) {
      const match = pathname.match(/\/(c\/|channel\/|user\/)?([^/]+)/)
      return match ? match[2] : null
    }
    
    return null
  } catch {
    return null
  }
}

export const generateSocialMediaUrl = (platform: string, handle: string): string => {
  const baseUrls: Record<string, string> = {
    tiktok: 'https://tiktok.com/@',
    instagram: 'https://instagram.com/',
    youtube: 'https://youtube.com/c/',
    twitter: 'https://twitter.com/',
    facebook: 'https://facebook.com/',
  }
  
  const baseUrl = baseUrls[platform.toLowerCase()]
  return baseUrl ? baseUrl + handle : ''
}

// Error handling utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
