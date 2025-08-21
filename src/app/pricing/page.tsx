import { PricingCard } from '@/components/pricing/PricingCard'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            選擇適合你的方案
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            為AI創業者量身打造的解決方案
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Free Tier */}
          <PricingCard
            name="Free"
            price="0"
            period="月"
            description="適合個人開發者和小型專案"
            features={[
              '基本功能試用',
              '每月100次API調用',
              '社群支援',
              '基礎文檔'
            ]}
            buttonText="開始免費試用"
            buttonVariant="outline"
            priceId={null}
            popular={false}
          />

          {/* Pro Tier */}
          <PricingCard
            name="Pro"
            price="29"
            period="月"
            description="適合成長中的AI創業團隊"
            features={[
              'Entitlements Sandbox',
              'JSON-AI Salvage Kit',
              'Pipeline Dashboard',
              '無限API調用',
              '優先支援',
              '進階分析'
            ]}
            buttonText="開始Pro方案"
            buttonVariant="primary"
            priceId="price_pro_monthly"
            popular={true}
          />

          {/* Enterprise Tier */}
          <PricingCard
            name="Enterprise"
            price="99"
            period="月"
            description="適合大型企業和客製化需求"
            features={[
              '所有Pro功能',
              '客製化開發',
              '專屬支援',
              'SLA保證',
              '白標解決方案',
              '專案管理'
            ]}
            buttonText="聯絡銷售"
            buttonVariant="outline"
            priceId="price_enterprise_monthly"
            popular={false}
          />
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            常見問題
          </h2>
          <div className="max-w-3xl mx-auto space-y-4 text-left">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                可以隨時取消訂閱嗎？
              </h3>
              <p className="text-gray-600">
                是的，你可以隨時取消訂閱。取消後，你仍然可以使用服務直到當前的計費週期結束。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                支援哪些支付方式？
              </h3>
              <p className="text-gray-600">
                我們支援所有主要的信用卡和借記卡，包括Visa、Mastercard、American Express等。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                有免費試用期嗎？
              </h3>
              <p className="text-gray-600">
                是的，我們提供14天的免費試用期，無需信用卡即可開始使用。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
