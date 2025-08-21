'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { subscriptionService, featureService } from '@/lib/database'
import { ErrorMessage, WarningMessage } from '@/components/ui/ErrorMessage'
import { createAppError } from '@/lib/error-handler'

interface PermissionInfo {
  feature: string
  name: string
  description: string
  requiredTier: 'free' | 'pro' | 'enterprise'
  hasAccess: boolean
  currentTier: 'free' | 'pro' | 'enterprise'
}

export function PermissionManager() {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<PermissionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [currentTier, setCurrentTier] = useState<'free' | 'pro' | 'enterprise'>('free')

  useEffect(() => {
    if (user) {
      loadPermissions()
    }
  }, [user])

  const loadPermissions = async () => {
    setLoading(true)
    setError(null)

    try {
      // 獲取所有功能
      const features = await featureService.getAllFeatures()
      
      // 檢查用戶對每個功能的訪問權限
      const permissionPromises = features.map(async (feature) => {
        const hasAccess = await subscriptionService.hasFeatureAccess(feature.name)
        return {
          feature: feature.name,
          name: feature.name,
          description: feature.description || '',
          requiredTier: feature.required_tier,
          hasAccess,
          currentTier: 'free' // 暫時設為 free，後續可以從訂閱獲取
        }
      })

      const permissionResults = await Promise.all(permissionPromises)
      setPermissions(permissionResults)

      // 獲取用戶當前訂閱等級
      const subscription = await subscriptionService.getUserSubscription()
      if (subscription) {
        // 根據訂閱狀態確定等級
        setCurrentTier(subscription.status === 'active' ? 'pro' : 'free')
      }

    } catch (err) {
      console.error('Error loading permissions:', err)
      setError(createAppError('DATABASE_ERROR', '無法載入權限資訊'))
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-800'
      case 'pro':
        return 'bg-blue-100 text-blue-800'
      case 'enterprise':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'free':
        return '免費版'
      case 'pro':
        return '專業版'
      case 'enterprise':
        return '企業版'
      default:
        return tier
    }
  }

  const canUpgrade = (requiredTier: string) => {
    const tierOrder = { free: 0, pro: 1, enterprise: 2 }
    return tierOrder[requiredTier as keyof typeof tierOrder] > tierOrder[currentTier]
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">請先登入</h2>
          <p className="text-gray-600">您需要登入才能查看權限資訊</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入權限資訊中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">權限管理</h1>
          <p className="mt-2 text-gray-600">查看和管理您的功能訪問權限</p>
        </div>

        {/* 當前訂閱狀態 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">當前訂閱狀態</h2>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(currentTier)}`}>
              {getTierName(currentTier)}
            </span>
            <span className="text-gray-600">
              您目前擁有 {getTierName(currentTier)} 的權限
            </span>
          </div>
          {currentTier === 'free' && (
            <div className="mt-4">
              <WarningMessage 
                message="升級到專業版以解鎖更多功能"
                autoDismiss={false}
              />
            </div>
          )}
        </div>

        {/* 錯誤提示 */}
        <ErrorMessage 
          error={error} 
          onDismiss={() => setError(null)}
          autoDismiss={false}
        />

        {/* 功能權限列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">功能權限</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {permissions.map((permission) => (
              <div key={permission.feature} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {permission.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(permission.requiredTier)}`}>
                        {getTierName(permission.requiredTier)}
                      </span>
                      {permission.hasAccess ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          可訪問
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          無權限
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-gray-600">{permission.description}</p>
                  </div>
                  <div className="ml-6">
                    {!permission.hasAccess && canUpgrade(permission.requiredTier) && (
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        升級
                      </button>
                    )}
                    {!permission.hasAccess && !canUpgrade(permission.requiredTier) && (
                      <span className="text-sm text-gray-500">
                        需要 {getTierName(permission.requiredTier)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 權限說明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">權限說明</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>免費版</strong>：基礎功能，適合個人用戶試用</p>
            <p>• <strong>專業版</strong>：完整功能，適合小型團隊和創業者</p>
            <p>• <strong>企業版</strong>：高級功能，適合大型企業和專業用戶</p>
          </div>
        </div>

        {/* 升級建議 */}
        {currentTier === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-medium mb-2">升級建議</h3>
            <p className="mb-4">升級到專業版以獲得完整的功能訪問權限和更好的使用體驗</p>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              查看定價方案
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
