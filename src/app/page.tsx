import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Tool Zoo</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/entitlements" className="text-gray-500 hover:text-gray-900">
                Entitlements
              </Link>
              <Link href="/json-salvage" className="text-gray-500 hover:text-gray-900">
                JSON Salvage
              </Link>
              <Link href="/pipeline" className="text-gray-500 hover:text-gray-900">
                Pipeline
              </Link>
              <Link href="/pricing" className="text-gray-500 hover:text-gray-900">
                Pricing
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-500 hover:text-gray-900">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            AI創業者的
            <span className="text-blue-600">一盒化解決方案</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            單人友好、意見強、開箱有SLO與E2E、內含前/後對照Dashboard
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link 
              href="/pricing" 
              className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700"
            >
              查看定價
            </Link>
            <Link 
              href="/docs" 
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-50"
            >
              查看文檔
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Entitlements Sandbox</h3>
            <p className="text-gray-600">
              多租戶權限管理解決方案，Stripe × Supabase整合，RLS安全架構
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">JSON-AI Salvage Kit</h3>
            <p className="text-gray-600">
              AI輸出格式修復工具，JSON Schema驗證，分級修復策略
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pipeline Dashboard</h3>
            <p className="text-gray-600">
              AI Pipeline全流程監控，端到端性能監控，成本分析
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-blue-600 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            準備好開始了嗎？
          </h2>
          <p className="text-blue-100 mb-6">
            加入數百位AI創業者的行列，使用Tool Zoo加速你的產品開發
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/features" 
              className="bg-white text-blue-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100"
            >
              開始使用
            </Link>
            <Link 
              href="/pricing" 
              className="border border-white text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700"
            >
              查看定價
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tool Zoo</h3>
              <p className="text-gray-400">
                AI創業者的一盒化解決方案
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">產品</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/entitlements" className="hover:text-white">Entitlements</Link></li>
                <li><Link href="/json-salvage" className="hover:text-white">JSON Salvage</Link></li>
                <li><Link href="/pipeline" className="hover:text-white">Pipeline</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">資源</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white">文檔</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
                <li><Link href="/support" className="hover:text-white">支援</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">公司</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">關於我們</Link></li>
                <li><Link href="/pricing" className="hover:text-white">定價</Link></li>
                <li><Link href="/contact" className="hover:text-white">聯絡我們</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 Tool Zoo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
