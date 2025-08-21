'use client'

import { useState } from 'react'
import { signIn } from '@/lib/supabase-auth'
import { SignInSchema } from '@/lib/types'
import { useFormValidation } from '@/hooks/useFormValidation'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { handleSupabaseError, createAppError } from '@/lib/error-handler'

export function SignInForm() {
  const [appError, setAppError] = useState<any>(null)

  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    handleSubmit
  } = useFormValidation({
    schema: SignInSchema,
    initialValues: {
      email: '',
      password: ''
    },
    onSubmit: async (values) => {
      try {
        await signIn(values.email, values.password)
        // 登入成功後會自動重定向或更新狀態
      } catch (error: any) {
        const appError = handleSupabaseError(error)
        setAppError(appError)
        throw appError
      }
    },
    onError: (validationErrors) => {
      const error = createAppError('VALIDATION_ERROR', '請檢查輸入的資料')
      setAppError(error)
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登入你的帳號
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            或{' '}
            <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              註冊新帳號
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                電子郵件
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  touched.email && errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="電子郵件"
                value={values.email}
                onChange={(e) => setFieldValue('email', e.target.value)}
                onBlur={() => setFieldTouched('email', true)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  touched.password && errors.password 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="密碼"
                value={values.password}
                onChange={(e) => setFieldValue('password', e.target.value)}
                onBlur={() => setFieldTouched('password', true)}
              />
            </div>
          </div>

          {/* 字段錯誤提示 */}
          {touched.email && errors.email && (
            <div className="text-red-600 text-sm text-center">
              {errors.email}
            </div>
          )}
          {touched.password && errors.password && (
            <div className="text-red-600 text-sm text-center">
              {errors.password}
            </div>
          )}

          {/* 應用錯誤提示 */}
          <ErrorMessage 
            error={appError} 
            onDismiss={() => setAppError(null)}
            autoDismiss={false}
          />

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '登入中...' : '登入'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                忘記密碼？
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
