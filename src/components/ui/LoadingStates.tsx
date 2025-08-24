'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react'

// 骨架屏組件
interface SkeletonProps {
  className?: string
  lines?: number
  variant?: 'text' | 'card' | 'avatar' | 'button'
}

export function Skeleton({ className = '', lines = 1, variant = 'text' }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (variant === 'avatar') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
      </div>
    )
  }

  if (variant === 'button') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded-md w-24"></div>
      </div>
    )
  }

  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  )
}

// 加載動畫組件
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
      />
      {text && (
        <span className="ml-2 text-sm text-gray-600">{text}</span>
      )}
    </div>
  )
}

// 進度條組件
interface ProgressBarProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  animated?: boolean
  className?: string
}

export function ProgressBar({ 
  progress, 
  size = 'md', 
  showPercentage = false,
  animated = true,
  className = '' 
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={`bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`bg-blue-600 rounded-full transition-all duration-300 ${
            animated ? 'animate-pulse' : ''
          } ${sizeClasses[size]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-gray-500 mt-1 text-right">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}

// 智能加載組件
interface SmartLoadingProps {
  isLoading: boolean
  error?: Error | string | null
  onRetry?: () => void
  children: React.ReactNode
  loadingText?: string
  errorText?: string
  className?: string
}

export function SmartLoading({
  isLoading,
  error,
  onRetry,
  children,
  loadingText = '載入中...',
  errorText = '載入失敗',
  className = ''
}: SmartLoadingProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" text={loadingText} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{errorText}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              重試
            </button>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// 延遲加載組件
interface DelayedLoadingProps {
  delay?: number
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function DelayedLoading({ 
  delay = 500, 
  children, 
  fallback 
}: DelayedLoadingProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!show) {
    return fallback || <LoadingSpinner size="sm" text="準備中..." />
  }

  return <>{children}</>
}

// 狀態指示器組件
interface StatusIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'idle'
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusIndicator({ 
  status, 
  text, 
  size = 'md',
  className = '' 
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className={`animate-spin ${sizeClasses[size]} text-blue-600`} />
      case 'success':
        return <CheckCircle className={`${sizeClasses[size]} text-green-600`} />
      case 'error':
        return <AlertCircle className={`${sizeClasses[size]} text-red-600`} />
      case 'idle':
        return <Clock className={`${sizeClasses[size]} text-gray-400`} />
      default:
        return null
    }
  }

  return (
    <div className={`flex items-center ${className}`}>
      {getIcon()}
      {text && (
        <span className="ml-2 text-sm text-gray-600">{text}</span>
      )}
    </div>
  )
}

// 頁面加載組件
interface PageLoadingProps {
  title?: string
  subtitle?: string
  showProgress?: boolean
  progress?: number
}

export function PageLoading({ 
  title = '載入中', 
  subtitle = '請稍候...',
  showProgress = false,
  progress = 0
}: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {subtitle}
        </p>

        {showProgress && (
          <div className="w-64 mx-auto">
            <ProgressBar progress={progress} showPercentage />
          </div>
        )}
      </div>
    </div>
  )
}

// 內容加載組件
interface ContentLoadingProps {
  type?: 'list' | 'grid' | 'table' | 'form'
  count?: number
  className?: string
}

export function ContentLoading({ 
  type = 'list', 
  count = 3,
  className = '' 
}: ContentLoadingProps) {
  if (type === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} variant="card" />
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
            <Skeleton variant="avatar" />
            <div className="flex-1">
              <Skeleton lines={2} />
            </div>
            <Skeleton variant="button" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'form') {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton lines={1} />
        <Skeleton lines={1} />
        <Skeleton lines={3} />
        <Skeleton variant="button" className="w-24" />
      </div>
    )
  }

  // list type (default)
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} lines={2} />
      ))}
    </div>
  )
}

