import Link from 'next/link'
import { Metadata } from 'next'
import WelcomeEmailSignup from '@/components/marketing/WelcomeEmailSignup'

export const metadata: Metadata = {
  title: 'Tool Zoo 技術博客 - AI 創業者的一站式解決方案',
  description: '分享 AI 創業、技術架構、產品開發的實戰經驗和最佳實踐',
  keywords: 'AI 創業, 技術架構, 產品開發, JSON 修復, 權限管理, Pipeline 監控',
  openGraph: {
    title: 'Tool Zoo 技術博客',
    description: 'AI 創業者的一站式解決方案',
    type: 'website',
  },
}

// 博客文章數據
const blogPosts = [
  {
    id: 'getting-started-with-tool-zoo',
    title: '從零開始：使用 Tool Zoo 構建 AI 創業項目',
    excerpt: '了解如何使用 Tool Zoo 的三個核心功能快速搭建 AI 創業項目的技術基礎，從權限管理到 JSON 修復，再到 Pipeline 監控。',
    author: 'Tool Zoo 團隊',
    publishedAt: '2025-01-21',
    readTime: '8 分鐘',
    category: '入門指南',
    tags: ['入門', 'AI 創業', '技術架構'],
    featured: true
  },
  {
    id: 'json-salvage-kit-deep-dive',
    title: '深度解析：JSON-AI Salvage Kit 的智能修復策略',
    excerpt: '深入探討 JSON-AI Salvage Kit 的四級修復策略，從基礎的正則修復到 AI 驅動的語義修復，提升 AI 輸出的可靠性。',
    author: 'Tool Zoo 團隊',
    publishedAt: '2025-01-20',
    readTime: '12 分鐘',
    category: '技術深度',
    tags: ['JSON 修復', 'AI 輸出', '智能策略'],
    featured: true
  },
  {
    id: 'entitlements-sandbox-best-practices',
    title: '最佳實踐：多租戶權限管理的安全架構',
    excerpt: '分享 Entitlements Sandbox 在多租戶環境中的最佳實踐，包括 RLS 策略、權限模板和批量操作的安全考量。',
    author: 'Tool Zoo 團隊',
    publishedAt: '2025-01-19',
    readTime: '10 分鐘',
    category: '安全架構',
    tags: ['權限管理', '多租戶', '安全'],
    featured: false
  },
  {
    id: 'pipeline-dashboard-monitoring',
    title: '實時監控：AI Pipeline 的性能優化指南',
    excerpt: '如何使用 Pipeline Dashboard 監控 AI 流程的性能、成本和用戶體驗，實現數據驅動的優化決策。',
    author: 'Tool Zoo 團隊',
    publishedAt: '2025-01-18',
    readTime: '15 分鐘',
    category: '性能優化',
    tags: ['監控', '性能優化', '成本控制'],
    featured: false
  },
  {
    id: 'ai-startup-architecture',
    title: 'AI 創業公司的技術架構設計',
    excerpt: '基於實戰經驗，分享 AI 創業公司在技術架構設計上的關鍵決策和常見陷阱，幫助你避免技術債務。',
    author: 'Tool Zoo 團隊',
    publishedAt: '2025-01-17',
    readTime: '20 分鐘',
    category: '架構設計',
    tags: ['技術架構', 'AI 創業', '最佳實踐'],
    featured: false
  },
  {
    id: 'stripe-supabase-integration',
    title: 'Stripe + Supabase：支付與權限的完美整合',
    excerpt: '詳細介紹如何將 Stripe 支付系統與 Supabase 權限管理完美整合，實現從付費到功能解鎖的無縫體驗。',
    author: 'Tool Zoo 團隊',
    publishedAt: '2025-01-16',
    readTime: '14 分鐘',
    category: '整合指南',
    tags: ['Stripe', 'Supabase', '支付整合'],
    featured: false
  }
]

const categories = [
  { name: '入門指南', count: 1 },
  { name: '技術深度', count: 1 },
  { name: '安全架構', count: 1 },
  { name: '性能優化', count: 1 },
  { name: '架構設計', count: 1 },
  { name: '整合指南', count: 1 }
]

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tool Zoo 技術博客
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              分享 AI 創業、技術架構、產品開發的實戰經驗和最佳實踐。
              從入門指南到深度技術解析，幫助你快速構建可靠的 AI 應用。
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/features"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                開始使用 Tool Zoo
              </Link>
              <Link
                href="#newsletter"
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                訂閱更新
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 側邊欄 */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* 分類 */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">分類</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={`/blog/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex justify-between items-center text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <span>{category.name}</span>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 熱門標籤 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">熱門標籤</h3>
                <div className="flex flex-wrap gap-2">
                  {['AI 創業', '技術架構', 'JSON 修復', '權限管理', '監控', '最佳實踐'].map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 主要內容 */}
          <div className="lg:col-span-3">
            {/* 精選文章 */}
            {featuredPosts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">精選文章</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {post.category}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{post.readTime}</span>
                          <span className="mx-2">•</span>
                          <span>{post.publishedAt}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">作者：{post.author}</span>
                          <Link
                            href={`/blog/${post.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            閱讀全文 →
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* 所有文章 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">所有文章</h2>
              <div className="space-y-6">
                {regularPosts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        {post.category}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{post.readTime}</span>
                      <span className="mx-2">•</span>
                      <span>{post.publishedAt}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">作者：{post.author}</span>
                        <div className="flex space-x-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link
                        href={`/blog/${post.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        閱讀全文 →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter 訂閱 */}
      <div id="newsletter" className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <WelcomeEmailSignup
              title="訂閱我們的技術更新"
              description="獲取最新的 AI 創業技術文章、產品更新和最佳實踐分享"
              buttonText="立即訂閱"
              successMessage="感謝您的訂閱！我們已發送歡迎郵件到您的郵箱。"
              className="bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
