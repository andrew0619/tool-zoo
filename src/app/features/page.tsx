import { FeaturesNavigation } from '@/components/features/FeaturesNavigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function FeaturesPage() {
  return (
    <ProtectedRoute>
      <FeaturesNavigation />
    </ProtectedRoute>
  )
}

