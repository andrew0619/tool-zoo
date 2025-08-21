'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

const features = [
  {
    name: 'Entitlements Sandbox',
    description: '多租戶權限管理',
    href: '/features/entitlements',
    icon: '🔐',
    color: 'bg-blue-500'
  },
  {
    name: 'JSON-AI Salvage Kit',
    description: 'AI 輸出格式修復',
    href: '/features/salvage',
    icon: '🔧',
    color: 'bg-green-500'
  },
  {
    name: 'Pipeline Dashboard',
    description: 'AI 管道監控',
    href: '/features/dashboard',
    icon: '📊',
    color: 'bg-purple-500'
  }
]

export function FeaturesNavigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">請先登入</h2>
          <p className="text-gray-600">您需要登入才能訪問功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tool Zoo 功能</h1>
          <p className="mt-2 text-gray-600">選擇您要使用的功能</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const isActive = pathname === feature.href
            return (
              <Link
                key={feature.name}
                href={feature.href}
                className={`block group relative rounded-lg border p-6 hover:shadow-lg transition-all duration-200 ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${feature.color} text-white`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-medium ${
                      isActive ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {feature.name}
                    </h3>
                    <p className={`text-sm ${
                      isActive ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* 返回首頁 */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            ← 返回首頁
          </Link>
        </div>
      </div>
    </div>
  )
}

