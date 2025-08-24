import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '從零開始：使用 Tool Zoo 構建 AI 創業項目 | Tool Zoo 技術博客',
  description: '了解如何使用 Tool Zoo 的三個核心功能快速搭建 AI 創業項目的技術基礎，從權限管理到 JSON 修復，再到 Pipeline 監控。',
  keywords: 'AI 創業, Tool Zoo, 權限管理, JSON 修復, Pipeline 監控, 技術架構',
  openGraph: {
    title: '從零開始：使用 Tool Zoo 構建 AI 創業項目',
    description: '了解如何使用 Tool Zoo 的三個核心功能快速搭建 AI 創業項目的技術基礎',
    type: 'article',
  },
}

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 文章頭部 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← 返回博客
            </Link>
          </div>
          
          <div className="mb-6">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              入門指南
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            從零開始：使用 Tool Zoo 構建 AI 創業項目
          </h1>
          
          <div className="flex items-center text-gray-600 mb-8">
            <span>作者：Tool Zoo 團隊</span>
            <span className="mx-2">•</span>
            <span>2025-01-21</span>
            <span className="mx-2">•</span>
            <span>8 分鐘閱讀</span>
          </div>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            在 AI 創業的浪潮中，技術架構的選擇往往決定了項目的成敗。
            本文將帶你了解如何使用 Tool Zoo 的三個核心功能快速搭建 AI 創業項目的技術基礎，
            從權限管理到 JSON 修復，再到 Pipeline 監控。
          </p>
        </div>
      </div>

      {/* 文章內容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="prose prose-lg max-w-none">
          <h2>為什麼選擇 Tool Zoo？</h2>
          
          <p>
            作為 AI 創業者，我們面臨著共同的挑戰：
          </p>
          
          <ul>
            <li><strong>技術債務</strong>：快速原型變成生產系統時缺乏可靠性</li>
            <li><strong>觀測缺失</strong>：沒有 SLO、E2E 測試、前後對照 Dashboard</li>
            <li><strong>單人開發</strong>：缺乏「單人友好、意見強」的完整解決方案</li>
            <li><strong>開箱即用</strong>：需要「一鍵種子」而不是從零開始</li>
          </ul>
          
          <p>
            Tool Zoo 正是為了解決這些問題而生。它提供「單人友好、意見強、開箱有 SLO 與 E2E、
            內含前/後對照 Dashboard」的一盒化方案，讓你可以專注於業務邏輯，而不是基礎設施。
          </p>

          <h2>Tool Zoo 的三個核心功能</h2>
          
          <h3>1. Entitlements Sandbox - 多租戶權限管理</h3>
          
          <p>
            在 AI 創業項目中，權限管理是一個容易被忽視但極其重要的環節。
            Entitlements Sandbox 提供了完整的多租戶權限管理解決方案：
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg my-6">
            <h4 className="font-semibold mb-3">核心特性：</h4>
            <ul className="space-y-2">
              <li>✅ Stripe × Supabase 完美整合</li>
              <li>✅ RLS (Row-Level Security) 策略</li>
              <li>✅ Webhook 冪等處理</li>
              <li>✅ 前端 Feature Gates</li>
              <li>✅ 權限模板系統</li>
              <li>✅ 批量操作功能</li>
            </ul>
          </div>
          
          <p>
            使用 Entitlements Sandbox，你可以輕鬆實現：
          </p>
          
          <ul>
            <li>用戶註冊後自動分配基礎權限</li>
            <li>付費訂閱後自動解鎖高級功能</li>
            <li>多租戶環境下的數據隔離</li>
            <li>權限變更的審計日誌</li>
          </ul>

          <h3>2. JSON-AI Salvage Kit - AI 輸出修復工具</h3>
          
          <p>
            AI 模型的輸出往往不穩定，特別是 JSON 格式的輸出。
            JSON-AI Salvage Kit 提供了智能的修復策略：
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg my-6">
            <h4 className="font-semibold mb-3">四級修復策略：</h4>
            <ul className="space-y-2">
              <li>🟢 <strong>基礎策略</strong>：修復引號、逗號等語法錯誤</li>
              <li>🟡 <strong>中級策略</strong>：修復括號、數字格式等結構問題</li>
              <li>🟠 <strong>高級策略</strong>：修復嵌套結構、編碼問題</li>
              <li>🔴 <strong>AI 驅動策略</strong>：語義修復、Schema 推斷</li>
            </ul>
          </div>
          
          <p>
            這個工具可以：
          </p>
          
          <ul>
            <li>自動檢測和修復 JSON 格式錯誤</li>
            <li>提供修復策略的置信度評分</li>
            <li>支持批量處理大量 JSON 數據</li>
            <li>生成修復報告和統計分析</li>
          </ul>

          <h3>3. Pipeline Dashboard - AI 流程監控</h3>
          
          <p>
            監控是生產環境中不可或缺的環節。Pipeline Dashboard 提供了完整的監控解決方案：
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg my-6">
            <h4 className="font-semibold mb-3">監控指標：</h4>
            <ul className="space-y-2">
              <li>📊 <strong>性能指標</strong>：響應時間、成功率、錯誤率</li>
              <li>💰 <strong>成本指標</strong>：Token 使用量、API 調用成本</li>
              <li>👥 <strong>用戶體驗</strong>：滿意度評分、SLO 合規性</li>
              <li>🚨 <strong>告警系統</strong>：多級別警報和自定義規則</li>
            </ul>
          </div>

          <h2>快速開始指南</h2>
          
          <h3>步驟 1：一鍵部署</h3>
          
          <p>
            Tool Zoo 提供了一鍵部署功能，支持 Vercel + Supabase 的完整部署流程：
          </p>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg my-6 overflow-x-auto">
            <pre><code># 克隆項目
git clone https://github.com/your-org/tool-zoo.git
cd tool-zoo

# 一鍵部署
npm run deploy

# 或者分步部署
npm run deploy:setup    # 設置 Supabase
npm run deploy:vercel   # 部署到 Vercel</code></pre>
          </div>
          
          <h3>步驟 2：配置環境變數</h3>
          
          <p>
            部署完成後，你需要配置以下環境變數：
          </p>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg my-6 overflow-x-auto">
            <pre><code># Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe 配置
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret</code></pre>
          </div>
          
          <h3>步驟 3：初始化數據庫</h3>
          
          <p>
            Tool Zoo 會自動創建所需的數據表並插入初始數據：
          </p>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg my-6 overflow-x-auto">
            <pre><code># 自動執行數據庫遷移
npm run deploy:setup

# 或者手動執行
npx supabase db reset
npx supabase db push</code></pre>
          </div>

          <h2>實際應用場景</h2>
          
          <h3>場景 1：AI 聊天機器人</h3>
          
          <p>
            假設你正在構建一個 AI 聊天機器人，需要處理用戶的付費訂閱和 JSON 格式的 AI 響應：
          </p>
          
          <ol>
            <li><strong>權限管理</strong>：使用 Entitlements Sandbox 管理用戶的聊天次數限制</li>
            <li><strong>JSON 修復</strong>：使用 JSON-AI Salvage Kit 修復 AI 返回的格式錯誤</li>
            <li><strong>監控分析</strong>：使用 Pipeline Dashboard 監控聊天質量和成本</li>
          </ol>
          
          <h3>場景 2：AI 內容生成平台</h3>
          
          <p>
            對於 AI 內容生成平台，你需要：
          </p>
          
          <ol>
            <li><strong>多租戶支持</strong>：不同客戶的內容隔離和權限控制</li>
            <li><strong>批量處理</strong>：大量內容的批量生成和修復</li>
            <li><strong>成本控制</strong>：監控每個客戶的 API 使用成本</li>
          </ol>

          <h2>最佳實踐建議</h2>
          
          <h3>1. 權限設計原則</h3>
          
          <ul>
            <li>遵循最小權限原則</li>
            <li>使用權限模板標準化權限分配</li>
            <li>定期審計權限使用情況</li>
            <li>實現權限變更的審計日誌</li>
          </ul>
          
          <h3>2. JSON 修復策略</h3>
          
          <ul>
            <li>從基礎策略開始，逐步升級到高級策略</li>
            <li>設置合理的成本限制</li>
            <li>監控修復成功率和成本</li>
            <li>定期更新修復規則</li>
          </ul>
          
          <h3>3. 監控指標選擇</h3>
          
          <ul>
            <li>關注業務關鍵指標（KPI）</li>
            <li>設置合理的告警閾值</li>
            <li>建立監控儀表板的例行檢查</li>
            <li>定期分析監控數據，優化系統</li>
          </ul>

          <h2>總結</h2>
          
          <p>
            Tool Zoo 為 AI 創業者提供了一個完整的技術解決方案，涵蓋了從權限管理到數據處理再到系統監控的所有關鍵環節。
            通過使用 Tool Zoo，你可以：
          </p>
          
          <ul>
            <li>快速搭建可靠的技術基礎</li>
            <li>專注於業務邏輯而不是基礎設施</li>
            <li>獲得企業級的可靠性和監控能力</li>
            <li>降低技術債務和維護成本</li>
          </ul>
          
          <p>
            如果你正在構建 AI 創業項目，Tool Zoo 絕對值得一試。
            立即開始使用，讓你的 AI 創業之路更加順暢！
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 my-8">
            <h3 className="text-blue-900 font-semibold mb-2">下一步</h3>
            <p className="text-blue-800 mb-4">
              想要深入了解 Tool Zoo 的具體功能？查看我們的詳細文檔和教程。
            </p>
            <div className="flex space-x-4">
              <Link
                href="/features"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                查看功能演示
              </Link>
              <Link
                href="/docs"
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition-colors"
              >
                閱讀技術文檔
              </Link>
            </div>
          </div>
        </article>

        {/* 文章底部 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">標籤：</span>
              {['入門', 'AI 創業', '技術架構'].map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">分享：</span>
              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

