'use client'

import { useState, useEffect } from 'react'
import { AppError, ErrorCodes, getUserFriendlyMessage } from '@/lib/error-handler'

interface ErrorMessageProps {
  error: AppError | string | null
  onDismiss?: () => void
  autoDismiss?: boolean
  dismissDelay?: number
  className?: string
}

export function ErrorMessage({
  error,
  onDismiss,
  autoDismiss = false,
  dismissDelay = 5000,
  className = ''
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (error) {
      setIsVisible(true)
      
      if (autoDismiss) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          onDismiss?.()
        }, dismissDelay)
        
        return () => clearTimeout(timer)
      }
    } else {
      setIsVisible(false)
    }
  }, [error, autoDismiss, dismissDelay, onDismiss])

  if (!error || !isVisible) {
    return null
  }

  const errorMessage = typeof error === 'string' ? error : getUserFriendlyMessage(error)
  const errorCode = typeof error === 'string' ? 'UNKNOWN_ERROR' : error.code

  // 根據錯誤類型選擇不同的樣式
  const getErrorStyle = (code: string) => {
    switch (code) {
      case ErrorCodes.AUTH_REQUIRED:
      case ErrorCodes.PERMISSION_DENIED:
        return 'bg-red-50 border-red-200 text-red-800'
      case ErrorCodes.VALIDATION_ERROR:
      case ErrorCodes.INVALID_INPUT:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case ErrorCodes.FEATURE_NOT_AVAILABLE:
      case ErrorCodes.SUBSCRIPTION_REQUIRED:
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case ErrorCodes.NETWORK_ERROR:
      case ErrorCodes.TIMEOUT_ERROR:
        return 'bg-orange-50 border-orange-200 text-orange-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  return (
    <div className={`rounded-md border p-4 mb-4 ${getErrorStyle(errorCode)} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{errorMessage}</p>
          {typeof error !== 'string' && error.details && (
            <details className="mt-2 text-xs opacity-75">
              <summary className="cursor-pointer hover:opacity-100">
                查看詳細信息
              </summary>
              <pre className="mt-1 whitespace-pre-wrap">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => {
                setIsVisible(false)
                onDismiss?.()
              }}
              className="inline-flex rounded-md p-1.5 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            >
              <span className="sr-only">關閉</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 成功消息組件
interface SuccessMessageProps {
  message: string
  onDismiss?: () => void
  autoDismiss?: boolean
  dismissDelay?: number
  className?: string
}

export function SuccessMessage({
  message,
  onDismiss,
  autoDismiss = true,
  dismissDelay = 3000,
  className = ''
}: SuccessMessageProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, dismissDelay)
      
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, dismissDelay, onDismiss])

  if (!isVisible) {
    return null
  }

  return (
    <div className={`rounded-md border border-green-200 bg-green-50 p-4 mb-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-green-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.53a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.14-.094l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-green-800">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => {
                setIsVisible(false)
                onDismiss?.()
              }}
              className="inline-flex rounded-md p-1.5 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            >
              <span className="sr-only">關閉</span>
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 警告消息組件
interface WarningMessageProps {
  message: string
  onDismiss?: () => void
  autoDismiss?: boolean
  dismissDelay?: number
  className?: string
}

export function WarningMessage({
  message,
  onDismiss,
  autoDismiss = false,
  dismissDelay = 5000,
  className = ''
}: WarningMessageProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, dismissDelay)
      
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, dismissDelay, onDismiss])

  if (!isVisible) {
    return null
  }

  return (
    <div className={`rounded-md border border-yellow-200 bg-yellow-50 p-4 mb-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-yellow-800">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => {
                setIsVisible(false)
                onDismiss?.()
              }}
              className="inline-flex rounded-md p-1.5 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
            >
              <span className="sr-only">關閉</span>
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
