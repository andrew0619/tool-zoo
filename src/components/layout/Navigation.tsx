'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'

export function Navigation() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Tool Zoo
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/features" className="text-gray-500 hover:text-gray-900">
              功能
            </Link>
            <Link href="/health-check" className="text-gray-500 hover:text-gray-900">
              健康檢查
            </Link>
            <Link href="/blog" className="text-gray-500 hover:text-gray-900">
              博客
            </Link>
            <Link href="/pricing" className="text-gray-500 hover:text-gray-900">
              定價
            </Link>
            <Link href="/docs" className="text-gray-500 hover:text-gray-900">
              文檔
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-500 hover:text-gray-900"
                >
                  儀表板
                </Link>
                <div className="relative group">
                  <button className="text-gray-500 hover:text-gray-900">
                    {user.email}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      我的儀表板
                    </Link>
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      個人資料
                    </Link>
                    <button 
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      登出
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-500 hover:text-gray-900">
                  登入
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  註冊
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
