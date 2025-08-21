// 錯誤類型定義
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

// 錯誤代碼定義
export const ErrorCodes = {
  // 認證錯誤
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  
  // 權限錯誤
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  
  // 驗證錯誤
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  
  // 數據庫錯誤
  DATABASE_ERROR: 'DATABASE_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  
  // API 錯誤
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // 支付錯誤
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  STRIPE_ERROR: 'STRIPE_ERROR',
  WEBHOOK_ERROR: 'WEBHOOK_ERROR',
  
  // 通用錯誤
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const

// 錯誤消息映射
export const ErrorMessages = {
  [ErrorCodes.AUTH_REQUIRED]: '請先登入以繼續操作',
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: '電子郵件或密碼錯誤',
  [ErrorCodes.AUTH_TOKEN_EXPIRED]: '登入已過期，請重新登入',
  [ErrorCodes.PERMISSION_DENIED]: '您沒有權限執行此操作',
  [ErrorCodes.FEATURE_NOT_AVAILABLE]: '此功能在您的訂閱計劃中不可用',
  [ErrorCodes.SUBSCRIPTION_REQUIRED]: '需要訂閱才能使用此功能',
  [ErrorCodes.VALIDATION_ERROR]: '輸入數據驗證失敗',
  [ErrorCodes.INVALID_INPUT]: '輸入格式不正確',
  [ErrorCodes.REQUIRED_FIELD]: '必填欄位不能為空',
  [ErrorCodes.DATABASE_ERROR]: '數據庫操作失敗',
  [ErrorCodes.RECORD_NOT_FOUND]: '找不到請求的記錄',
  [ErrorCodes.DUPLICATE_RECORD]: '記錄已存在',
  [ErrorCodes.API_ERROR]: 'API 請求失敗',
  [ErrorCodes.NETWORK_ERROR]: '網絡連接錯誤',
  [ErrorCodes.TIMEOUT_ERROR]: '請求超時',
  [ErrorCodes.PAYMENT_ERROR]: '支付處理失敗',
  [ErrorCodes.STRIPE_ERROR]: 'Stripe 支付錯誤',
  [ErrorCodes.WEBHOOK_ERROR]: 'Webhook 處理錯誤',
  [ErrorCodes.UNKNOWN_ERROR]: '發生未知錯誤',
  [ErrorCodes.INTERNAL_ERROR]: '內部服務器錯誤'
} as const

// 創建應用錯誤
export function createAppError(
  code: keyof typeof ErrorCodes,
  message?: string,
  details?: any
): AppError {
  return {
    code,
    message: message || ErrorMessages[code],
    details,
    timestamp: new Date().toISOString()
  }
}

// 處理 Supabase 錯誤
export function handleSupabaseError(error: any): AppError {
  if (!error) {
    return createAppError('UNKNOWN_ERROR')
  }

  // Supabase 認證錯誤
  if (error.message?.includes('Invalid login credentials')) {
    return createAppError('AUTH_INVALID_CREDENTIALS')
  }

  if (error.message?.includes('JWT expired')) {
    return createAppError('AUTH_TOKEN_EXPIRED')
  }

  // Supabase 權限錯誤
  if (error.message?.includes('new row violates row-level security policy')) {
    return createAppError('PERMISSION_DENIED')
  }

  // Supabase 數據庫錯誤
  if (error.code === '23505') { // 唯一約束違反
    return createAppError('DUPLICATE_RECORD', '記錄已存在')
  }

  if (error.code === '23503') { // 外鍵約束違反
    return createAppError('DATABASE_ERROR', '關聯數據錯誤')
  }

  // 默認數據庫錯誤
  return createAppError('DATABASE_ERROR', error.message)
}

// 處理 API 錯誤
export function handleApiError(error: any): AppError {
  if (!error) {
    return createAppError('UNKNOWN_ERROR')
  }

  // 網絡錯誤
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return createAppError('NETWORK_ERROR')
  }

  // 超時錯誤
  if (error.name === 'AbortError') {
    return createAppError('TIMEOUT_ERROR')
  }

  // HTTP 狀態碼錯誤
  if (error.status) {
    switch (error.status) {
      case 400:
        return createAppError('VALIDATION_ERROR', error.message)
      case 401:
        return createAppError('AUTH_REQUIRED')
      case 403:
        return createAppError('PERMISSION_DENIED')
      case 404:
        return createAppError('RECORD_NOT_FOUND')
      case 409:
        return createAppError('DUPLICATE_RECORD')
      case 500:
        return createAppError('INTERNAL_ERROR')
      default:
        return createAppError('API_ERROR', error.message)
    }
  }

  return createAppError('API_ERROR', error.message)
}

// 處理 Stripe 錯誤
export function handleStripeError(error: any): AppError {
  if (!error) {
    return createAppError('PAYMENT_ERROR')
  }

  // Stripe 錯誤代碼處理
  switch (error.code) {
    case 'card_declined':
      return createAppError('PAYMENT_ERROR', '信用卡被拒絕')
    case 'expired_card':
      return createAppError('PAYMENT_ERROR', '信用卡已過期')
    case 'incorrect_cvc':
      return createAppError('PAYMENT_ERROR', 'CVC 碼不正確')
    case 'processing_error':
      return createAppError('PAYMENT_ERROR', '支付處理錯誤')
    case 'rate_limit':
      return createAppError('PAYMENT_ERROR', '請求過於頻繁，請稍後再試')
    default:
      return createAppError('STRIPE_ERROR', error.message)
  }
}

// 錯誤日誌記錄
export function logError(error: AppError, context?: any) {
  console.error('Application Error:', {
    ...error,
    context,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  })

  // TODO: 發送到錯誤監控服務 (Sentry, LogRocket 等)
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error)
  // }
}

// 用戶友好的錯誤消息
export function getUserFriendlyMessage(error: AppError): string {
  // 根據錯誤代碼返回用戶友好的消息
  switch (error.code) {
    case ErrorCodes.AUTH_REQUIRED:
      return '請先登入您的帳號'
    case ErrorCodes.AUTH_INVALID_CREDENTIALS:
      return '電子郵件或密碼不正確，請檢查後重試'
    case ErrorCodes.PERMISSION_DENIED:
      return '您沒有權限執行此操作，請聯繫管理員'
    case ErrorCodes.FEATURE_NOT_AVAILABLE:
      return '此功能需要升級您的訂閱計劃'
    case ErrorCodes.SUBSCRIPTION_REQUIRED:
      return '此功能需要訂閱，請選擇適合的計劃'
    case ErrorCodes.VALIDATION_ERROR:
      return '請檢查輸入的資料是否正確'
    case ErrorCodes.NETWORK_ERROR:
      return '網絡連接失敗，請檢查您的網絡連接'
    case ErrorCodes.TIMEOUT_ERROR:
      return '請求超時，請稍後再試'
    case ErrorCodes.PAYMENT_ERROR:
      return '支付處理失敗，請稍後再試或聯繫客服'
    default:
      return '發生錯誤，請稍後再試'
  }
}
