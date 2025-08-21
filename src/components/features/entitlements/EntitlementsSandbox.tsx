'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { subscriptionService, entitlementsService } from '@/lib/database'

interface Entitlement {
  id: string
  name: string
  description: string
  resource: string
  action: string
  tenant_id: string
  created_at: string
  updated_at: string
}

interface Tenant {
  id: string
  name: string
  domain: string
  status: 'active' | 'inactive'
  created_at: string
}

export function EntitlementsSandbox() {
  const { user, profile } = useAuth()
  const [entitlements, setEntitlements] = useState<Entitlement[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [user])

  const checkAccess = async () => {
    if (!user) return
    
    try {
      const access = await subscriptionService.hasFeatureAccess('entitlements_sandbox')
      setHasAccess(access)
      
      if (access) {
        loadData()
      }
    } catch (err) {
      setError('權限檢查失敗')
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // 從數據庫加載真實數據
      const [entitlementsData, tenantsData] = await Promise.all([
        entitlementsService.getEntitlements(),
        entitlementsService.getTenants()
      ])

      setEntitlements(entitlementsData)
      setTenants(tenantsData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('數據加載失敗')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">請先登入</h2>
          <p className="text-gray-600">您需要登入才能訪問 Entitlements Sandbox</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">權限不足</h2>
          <p className="text-gray-600">您沒有訪問 Entitlements Sandbox 的權限</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Entitlements Sandbox</h1>
          <p className="mt-2 text-gray-600">多租戶權限管理沙盒環境</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 租戶管理 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">租戶管理</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {tenants.map(tenant => (
                  <div key={tenant.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{tenant.name}</h3>
                        <p className="text-sm text-gray-500">{tenant.domain}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tenant.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tenant.status === 'active' ? '活躍' : '非活躍'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 權限管理 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">權限管理</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {entitlements.map(entitlement => (
                  <div key={entitlement.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{entitlement.name}</h3>
                        <p className="text-sm text-gray-500">{entitlement.description}</p>
                        <div className="mt-2 flex space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                            {entitlement.resource}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                            {entitlement.action}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 測試區域 */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">權限測試</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                測試讀取權限
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                測試創建權限
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                測試刪除權限
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

