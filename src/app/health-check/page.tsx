import { HealthDashboard } from '@/components/health/HealthDashboard'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function HealthCheckPage() {
  return (
    <ProtectedRoute>
      <HealthDashboard 
        projectId="tool-zoo-main"
        autoRefresh={true}
        refreshInterval={300000} // 5 minutes
      />
    </ProtectedRoute>
  )
}

export const metadata = {
  title: '項目健康檢查 - Tool Zoo',
  description: '實時監控項目的技術健康狀況，包括性能、安全性、可靠性等多個維度的分析'
}

