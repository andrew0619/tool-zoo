'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setLoading(false)
    }
  }, [user])

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
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 頁面標題 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">用戶儀表板</h1>
            <p className="mt-2 text-gray-600">歡迎回來，{user?.email}</p>
          </div>

          {/* 用戶信息卡片 */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">帳號信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">電子郵件</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">用戶 ID</label>
                <p className="mt-1 text-sm text-gray-900">{user?.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">註冊時間</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-TW') : '未知'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">郵箱驗證狀態</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.email_confirmed_at ? '已驗證' : '未驗證'}
                </p>
              </div>
            </div>
          </div>

          {/* 功能快速訪問 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Entitlements Sandbox</h3>
              <p className="text-gray-600 mb-4">多租戶權限管理解決方案</p>
              <a 
                href="/features/entitlements" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                開始使用
              </a>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">JSON-AI Salvage Kit</h3>
              <p className="text-gray-600 mb-4">AI輸出格式修復工具</p>
              <a 
                href="/features/salvage" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                開始使用
              </a>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pipeline Dashboard</h3>
              <p className="text-gray-600 mb-4">AI Pipeline全流程監控</p>
              <a 
                href="/features/dashboard" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                開始使用
              </a>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                編輯資料
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                查看訂閱
              </button>
            </div>
            <button 
              onClick={signOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
