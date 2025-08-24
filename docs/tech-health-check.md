# 技術健康檢查系統

## 📋 **概述**

技術健康檢查系統是 Tool Zoo 的核心功能之一，提供全面的項目健康狀況分析和監控。系統會自動檢查項目的各個技術維度，生成詳細的健康報告，並提供可執行的改進建議。

## 🏗️ **系統架構**

### **核心組件**

1. **TechHealthCheck 類** (`src/lib/tech-health-check.ts`)
   - 主要的健康檢查引擎
   - 執行各項技術指標分析
   - 生成綜合健康報告

2. **健康檢查 API** (`src/app/api/health-check/`)
   - `/api/health-check` - 執行健康檢查
   - `/api/health-check/history` - 查看歷史記錄
   - `/api/health-check/compare` - 比較不同報告

3. **健康儀表板** (`src/components/health/HealthDashboard.tsx`)
   - 可視化健康狀況
   - 實時監控和自動刷新
   - 互動式問題管理

4. **工具類** (`src/lib/health-utils.ts`)
   - 健康分數計算
   - 狀態判定邏輯
   - 報告格式化和導出

## 📊 **檢查維度**

### **1. 性能 (Performance)**
- **包大小分析**: 檢查應用程序包的大小和優化程度
- **構建時間**: 分析構建效率和優化空間
- **Lighthouse 分數**: Web 性能指標評估
- **加載時間**: 頁面和資源加載性能

### **2. 安全性 (Security)**
- **依賴漏洞**: 掃描第三方依賴的安全漏洞
- **環境變量安全**: 檢查敏感信息洩露風險
- **HTTPS 配置**: 驗證安全傳輸配置
- **認證機制**: 評估身份驗證和授權實現

### **3. 可靠性 (Reliability)**
- **錯誤處理覆蓋率**: 分析異常處理的完整性
- **日誌記錄**: 評估日誌策略和實現質量
- **監控配置**: 檢查應用程序監控設置
- **容錯機制**: 評估系統的容錯能力

### **4. 可維護性 (Maintainability)**
- **代碼複雜度**: 分析圈複雜度和認知負載
- **代碼重複率**: 檢測重複代碼和重構機會
- **TypeScript 覆蓋率**: 評估類型安全程度
- **代碼風格一致性**: 檢查編碼標準遵循情況

### **5. 可擴展性 (Scalability)**
- **架構模式**: 評估系統架構的可擴展性
- **API 設計**: 分析 API 的 RESTful 程度和一致性
- **數據庫設計**: 檢查數據模型和查詢優化
- **模塊化程度**: 評估代碼的模塊化和解耦程度

### **6. 測試 (Testing)**
- **測試覆蓋率**: 分析單元測試和集成測試覆蓋度
- **測試質量**: 評估測試的深度和有效性
- **E2E 測試**: 檢查端到端測試的完整性
- **測試自動化**: 評估測試流程的自動化程度

### **7. 文檔 (Documentation)**
- **README 完整性**: 檢查項目文檔的完整性
- **API 文檔覆蓋率**: 評估 API 文檔的完整性
- **代碼註釋率**: 分析代碼註釋的質量和覆蓋度
- **架構文檔**: 檢查系統設計文檔

### **8. 依賴管理 (Dependencies)**
- **過時依賴**: 檢查需要更新的依賴包
- **依賴包大小**: 分析依賴對項目大小的影響
- **許可證合規性**: 檢查依賴許可證的合規性
- **安全漏洞**: 掃描依賴中的已知漏洞

### **9. 基礎設施 (Infrastructure)**
- **Docker 配置**: 檢查容器化配置
- **CI/CD 配置**: 評估持續集成和部署設置
- **環境配置管理**: 檢查多環境配置管理
- **部署策略**: 評估部署流程和策略

### **10. 監控 (Monitoring)**
- **應用程序監控**: 檢查性能監控配置
- **錯誤追蹤**: 評估錯誤監控和告警設置
- **日誌聚合**: 檢查日誌收集和分析配置
- **指標收集**: 評估業務和技術指標收集

## 🎯 **評分系統**

### **分數範圍**
- **90-100**: 優秀 (Excellent) 🟢
- **75-89**: 良好 (Good) 🔵
- **60-74**: 警告 (Warning) 🟡
- **40-59**: 嚴重 (Critical) 🔴
- **0-39**: 未知 (Unknown) ⚪

### **加權計算**
不同維度具有不同的權重：
- **安全性**: 1.5 (最高優先級)
- **可靠性**: 1.3
- **性能**: 1.2
- **測試**: 1.2
- **可擴展性**: 1.1
- **基礎設施**: 1.1
- **可維護性**: 1.0
- **依賴管理**: 1.0
- **監控**: 1.0
- **文檔**: 0.8 (相對較低優先級)

## 🚀 **使用方式**

### **1. 程式化使用**

```typescript
import { TechHealthCheck } from '@/lib/tech-health-check'

// 創建健康檢查實例
const healthChecker = new TechHealthCheck('/path/to/project', {
  includeTests: true,
  includeDependencies: true,
  includePerformance: true,
  includeSecurity: true
})

// 執行健康檢查
const report = await healthChecker.analyzeProject('my-project')

console.log(`總體分數: ${report.overallScore}/100`)
console.log(`狀態: ${report.overallStatus}`)
```

### **2. API 使用**

```bash
# 執行健康檢查
curl -X GET "http://localhost:3000/api/health-check?projectId=my-project"

# 獲取歷史記錄
curl -X GET "http://localhost:3000/api/health-check/history?projectId=my-project&limit=10"

# 比較兩個報告
curl -X POST "http://localhost:3000/api/health-check/compare" \
  -H "Content-Type: application/json" \
  -d '{"baselineReportId": "report1", "currentReportId": "report2"}'
```

### **3. 前端組件使用**

```tsx
import { HealthDashboard } from '@/components/health/HealthDashboard'

function MyPage() {
  return (
    <HealthDashboard 
      projectId="my-project"
      autoRefresh={true}
      refreshInterval={300000} // 5 minutes
    />
  )
}
```

## 📈 **報告結構**

### **健康報告格式**

```typescript
interface HealthReport {
  projectId: string
  timestamp: string
  overallScore: number        // 0-100
  overallStatus: HealthStatus // excellent | good | warning | critical | unknown
  
  categories: Record<HealthCategory, {
    score: number
    status: HealthStatus
    metrics: HealthMetric[]
  }>
  
  issues: HealthIssue[]       // 發現的問題列表
  recommendations: string[]   // 改進建議
  
  summary: {
    totalMetrics: number
    passedMetrics: number
    warningMetrics: number
    criticalMetrics: number
    totalIssues: number
    criticalIssues: number
    autoFixableIssues: number
  }
  
  trends?: {                  // 趨勢分析（可選）
    scoreChange?: number
    previousScore?: number
    improvingMetrics: number
    degradingMetrics: number
  }
}
```

### **指標結構**

```typescript
interface HealthMetric {
  name: string                // 指標名稱
  category: HealthCategory    // 所屬類別
  status: HealthStatus        // 健康狀態
  score: number              // 分數 (0-100)
  value: string | number | boolean // 實際值
  description: string        // 描述
  recommendation?: string    // 改進建議
  lastChecked: string       // 檢查時間
  trend?: 'improving' | 'stable' | 'degrading' | 'unknown'
}
```

### **問題結構**

```typescript
interface HealthIssue {
  id: string
  category: HealthCategory
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  recommendation: string
  file?: string             // 相關文件
  line?: number            // 相關行號
  autoFixable: boolean     // 是否可自動修復
  estimatedEffort?: 'low' | 'medium' | 'high'
}
```

## 🛠️ **自定義配置**

### **檢查選項**

```typescript
interface ProjectAnalysisOptions {
  projectPath?: string        // 項目路徑
  includeTests?: boolean      // 是否包含測試檢查
  includeDependencies?: boolean // 是否包含依賴檢查
  includePerformance?: boolean  // 是否包含性能檢查
  includeSecurity?: boolean     // 是否包含安全檢查
  customChecks?: string[]      // 自定義檢查項目
}
```

### **閾值自定義**

```typescript
interface MetricThreshold {
  excellent: number    // 優秀閾值
  good: number        // 良好閾值
  warning: number     // 警告閾值
  critical: number    // 嚴重閾值
}
```

## 📊 **工具和集成**

### **支持的工具**
- **ESLint**: 代碼質量檢查
- **TypeScript**: 類型檢查
- **Jest**: 測試覆蓋率
- **npm audit**: 安全漏洞掃描
- **Lighthouse**: 性能評估
- **Docker**: 容器化檢查
- **GitHub Actions**: CI/CD 檢查

### **數據庫集成**
健康檢查報告可以保存到 Supabase 數據庫中：

```sql
CREATE TABLE health_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  report_data JSONB NOT NULL,
  overall_score INTEGER NOT NULL,
  overall_status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_health_reports_project_id ON health_reports(project_id);
CREATE INDEX idx_health_reports_created_at ON health_reports(created_at);
```

## 🔧 **擴展和自定義**

### **添加新的檢查項目**

```typescript
class CustomHealthCheck extends TechHealthCheck {
  private async checkCustomMetric(): Promise<HealthMetric[]> {
    // 實現自定義檢查邏輯
    return [{
      name: '自定義指標',
      category: 'performance',
      status: 'good',
      score: 85,
      value: 'custom_value',
      description: '自定義指標描述',
      lastChecked: new Date().toISOString()
    }]
  }
}
```

### **自定義評分邏輯**

```typescript
import { HealthUtils } from '@/lib/health-utils'

// 使用自定義權重
const customWeights = {
  security: 2.0,      // 提高安全性權重
  performance: 1.5,   // 提高性能權重
  documentation: 0.5  // 降低文檔權重
}

const score = HealthUtils.calculateWeightedScore(scores, customWeights)
```

## 📋 **最佳實踐**

### **1. 定期檢查**
- 建議每日自動執行健康檢查
- 在 CI/CD 流程中集成健康檢查
- 設置健康分數閾值作為部署門檻

### **2. 問題優先級**
1. **立即處理**: 嚴重安全漏洞和系統穩定性問題
2. **短期改進**: 高影響低努力的改進項目
3. **長期規劃**: 架構性改進和技術債務清理

### **3. 監控和告警**
- 設置健康分數下降告警
- 監控關鍵指標趨勢
- 建立健康狀況儀表板

### **4. 團隊協作**
- 將健康檢查結果納入代碼審查
- 定期討論健康狀況和改進計劃
- 建立健康指標的團隊目標

## 🚨 **故障排除**

### **常見問題**

1. **檢查失敗**
   - 確保項目路徑正確
   - 檢查必要的工具是否安裝
   - 驗證文件權限

2. **分數異常**
   - 檢查閾值配置
   - 驗證指標計算邏輯
   - 確認數據源的準確性

3. **性能問題**
   - 調整檢查範圍和深度
   - 使用並行處理
   - 緩存檢查結果

### **調試模式**

```typescript
const healthChecker = new TechHealthCheck(projectPath, {
  // 啟用詳細日誌
  verbose: true,
  // 只檢查特定類別
  categories: ['performance', 'security']
})
```

## 📚 **參考資料**

- [代碼質量指標](https://martinfowler.com/articles/useOfMetrics.html)
- [軟件健康度量](https://www.thoughtworks.com/insights/blog/fitness-function-driven-development)
- [技術債務管理](https://martinfowler.com/bliki/TechnicalDebt.html)
- [DevOps 指標](https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance)

---

**版本**: 1.0.0  
**最後更新**: 2025-08-22  
**維護者**: Tool Zoo 開發團隊

