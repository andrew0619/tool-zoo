import {
  createAppError,
  handleSupabaseError,
  handleApiError,
  handleStripeError,
  getUserFriendlyMessage,
  ErrorCodes,
} from '../error-handler'

describe('Error Handler', () => {
  describe('createAppError', () => {
    it('should create an error with default message', () => {
      const error = createAppError('AUTH_REQUIRED')
      
      expect(error).toEqual({
        code: 'AUTH_REQUIRED',
        message: '請先登入以繼續操作',
        details: undefined,
        timestamp: expect.any(String),
      })
    })

    it('should create an error with custom message', () => {
      const error = createAppError('AUTH_REQUIRED', 'Custom message')
      
      expect(error).toEqual({
        code: 'AUTH_REQUIRED',
        message: 'Custom message',
        details: undefined,
        timestamp: expect.any(String),
      })
    })

    it('should create an error with details', () => {
      const details = { userId: '123' }
      const error = createAppError('AUTH_REQUIRED', 'Custom message', details)
      
      expect(error).toEqual({
        code: 'AUTH_REQUIRED',
        message: 'Custom message',
        details,
        timestamp: expect.any(String),
      })
    })
  })

  describe('handleSupabaseError', () => {
    it('should handle authentication errors', () => {
      const supabaseError = { message: 'Invalid login credentials' }
      const error = handleSupabaseError(supabaseError)
      
      expect(error.code).toBe('AUTH_INVALID_CREDENTIALS')
    })

    it('should handle JWT expired errors', () => {
      const supabaseError = { message: 'JWT expired' }
      const error = handleSupabaseError(supabaseError)
      
      expect(error.code).toBe('AUTH_TOKEN_EXPIRED')
    })

    it('should handle RLS policy violations', () => {
      const supabaseError = { message: 'new row violates row-level security policy' }
      const error = handleSupabaseError(supabaseError)
      
      expect(error.code).toBe('PERMISSION_DENIED')
    })

    it('should handle unique constraint violations', () => {
      const supabaseError = { code: '23505', message: 'Duplicate key' }
      const error = handleSupabaseError(supabaseError)
      
      expect(error.code).toBe('DUPLICATE_RECORD')
    })

    it('should handle foreign key constraint violations', () => {
      const supabaseError = { code: '23503', message: 'Foreign key violation' }
      const error = handleSupabaseError(supabaseError)
      
      expect(error.code).toBe('DATABASE_ERROR')
    })

    it('should handle unknown errors', () => {
      const supabaseError = { message: 'Unknown database error' }
      const error = handleSupabaseError(supabaseError)
      
      expect(error.code).toBe('DATABASE_ERROR')
    })

    it('should handle null errors', () => {
      const error = handleSupabaseError(null)
      
      expect(error.code).toBe('UNKNOWN_ERROR')
    })
  })

  describe('handleApiError', () => {
    it('should handle network errors', () => {
      const apiError = { name: 'TypeError', message: 'fetch failed' }
      const error = handleApiError(apiError)
      
      expect(error.code).toBe('NETWORK_ERROR')
    })

    it('should handle timeout errors', () => {
      const apiError = { name: 'AbortError' }
      const error = handleApiError(apiError)
      
      expect(error.code).toBe('TIMEOUT_ERROR')
    })

    it('should handle 400 status errors', () => {
      const apiError = { status: 400, message: 'Bad request' }
      const error = handleApiError(apiError)
      
      expect(error.code).toBe('VALIDATION_ERROR')
    })

    it('should handle 401 status errors', () => {
      const apiError = { status: 401 }
      const error = handleApiError(apiError)
      
      expect(error.code).toBe('AUTH_REQUIRED')
    })

    it('should handle 403 status errors', () => {
      const apiError = { status: 403 }
      const error = handleApiError(apiError)
      
      expect(error.code).toBe('PERMISSION_DENIED')
    })

    it('should handle 404 status errors', () => {
      const apiError = { status: 404 }
      const error = handleApiError(apiError)
      
      expect(error.code).toBe('RECORD_NOT_FOUND')
    })

    it('should handle 409 status errors', () => {
      const apiError = { status: 409 }
      const error = handleApiError(apiError)
      
      expect(error.code).toBe('DUPLICATE_RECORD')
    })

    it('should handle 500 status errors', () => {
      const apiError = { status: 500 }
      const error = handleApiError(apiError)
      
      expect(error.code).toBe('INTERNAL_ERROR')
    })

    it('should handle unknown status errors', () => {
      const apiError = { status: 418, message: 'I\'m a teapot' }
      const error = handleApiError(apiError)
      
      expect(error.code).toBe('API_ERROR')
    })

    it('should handle errors without status', () => {
      const apiError = { message: 'Generic API error' }
      const error = handleApiError(apiError)
      
      expect(error.code).toBe('API_ERROR')
    })
  })

  describe('handleStripeError', () => {
    it('should handle card declined errors', () => {
      const stripeError = { code: 'card_declined' }
      const error = handleStripeError(stripeError)
      
      expect(error.code).toBe('PAYMENT_ERROR')
      expect(error.message).toBe('信用卡被拒絕')
    })

    it('should handle expired card errors', () => {
      const stripeError = { code: 'expired_card' }
      const error = handleStripeError(stripeError)
      
      expect(error.code).toBe('PAYMENT_ERROR')
      expect(error.message).toBe('信用卡已過期')
    })

    it('should handle incorrect CVC errors', () => {
      const stripeError = { code: 'incorrect_cvc' }
      const error = handleStripeError(stripeError)
      
      expect(error.code).toBe('PAYMENT_ERROR')
      expect(error.message).toBe('CVC 碼不正確')
    })

    it('should handle processing errors', () => {
      const stripeError = { code: 'processing_error' }
      const error = handleStripeError(stripeError)
      
      expect(error.code).toBe('PAYMENT_ERROR')
      expect(error.message).toBe('支付處理錯誤')
    })

    it('should handle rate limit errors', () => {
      const stripeError = { code: 'rate_limit' }
      const error = handleStripeError(stripeError)
      
      expect(error.code).toBe('PAYMENT_ERROR')
      expect(error.message).toBe('請求過於頻繁，請稍後再試')
    })

    it('should handle unknown Stripe errors', () => {
      const stripeError = { code: 'unknown_error', message: 'Unknown Stripe error' }
      const error = handleStripeError(stripeError)
      
      expect(error.code).toBe('STRIPE_ERROR')
      expect(error.message).toBe('Unknown Stripe error')
    })

    it('should handle null errors', () => {
      const error = handleStripeError(null)
      
      expect(error.code).toBe('PAYMENT_ERROR')
    })
  })

  describe('getUserFriendlyMessage', () => {
    it('should return user-friendly message for AUTH_REQUIRED', () => {
      const error = createAppError('AUTH_REQUIRED')
      const message = getUserFriendlyMessage(error)
      
      expect(message).toBe('請先登入您的帳號')
    })

    it('should return user-friendly message for AUTH_INVALID_CREDENTIALS', () => {
      const error = createAppError('AUTH_INVALID_CREDENTIALS')
      const message = getUserFriendlyMessage(error)
      
      expect(message).toBe('電子郵件或密碼不正確，請檢查後重試')
    })

    it('should return user-friendly message for PERMISSION_DENIED', () => {
      const error = createAppError('PERMISSION_DENIED')
      const message = getUserFriendlyMessage(error)
      
      expect(message).toBe('您沒有權限執行此操作，請聯繫管理員')
    })

    it('should return user-friendly message for FEATURE_NOT_AVAILABLE', () => {
      const error = createAppError('FEATURE_NOT_AVAILABLE')
      const message = getUserFriendlyMessage(error)
      
      expect(message).toBe('此功能需要升級您的訂閱計劃')
    })

    it('should return user-friendly message for SUBSCRIPTION_REQUIRED', () => {
      const error = createAppError('SUBSCRIPTION_REQUIRED')
      const message = getUserFriendlyMessage(error)
      
      expect(message).toBe('此功能需要訂閱，請選擇適合的計劃')
    })

    it('should return user-friendly message for VALIDATION_ERROR', () => {
      const error = createAppError('VALIDATION_ERROR')
      const message = getUserFriendlyMessage(error)
      
      expect(message).toBe('請檢查輸入的資料是否正確')
    })

    it('should return user-friendly message for NETWORK_ERROR', () => {
      const error = createAppError('NETWORK_ERROR')
      const message = getUserFriendlyMessage(error)
      
      expect(message).toBe('網絡連接失敗，請檢查您的網絡連接')
    })

    it('should return user-friendly message for TIMEOUT_ERROR', () => {
      const error = createAppError('TIMEOUT_ERROR')
      const message = getUserFriendlyMessage(error)
      
      expect(message).toBe('請求超時，請稍後再試')
    })

    it('should return user-friendly message for PAYMENT_ERROR', () => {
      const error = createAppError('PAYMENT_ERROR')
      const message = getUserFriendlyMessage(error)
      
      expect(message).toBe('支付處理失敗，請稍後再試或聯繫客服')
    })

    it('should return default message for unknown errors', () => {
      const error = createAppError('UNKNOWN_ERROR')
      const message = getUserFriendlyMessage(error)
      
      expect(message).toBe('發生錯誤，請稍後再試')
    })
  })
})

