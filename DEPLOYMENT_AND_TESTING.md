# Tool Zoo - 部署和測試系統

## 🚀 **一鍵部署系統**

### **快速部署**

```bash
# 完整部署（推薦）
npm run deploy

# 只設置環境變數
npm run deploy -- --env-only

# 跳過測試
npm run deploy -- --skip-tests

# 跳過構建
npm run deploy -- --skip-build
```

### **Supabase 設置**

```bash
# 設置 Supabase 環境
npm run deploy:setup

# 只設置本地環境
npm run deploy:setup -- --local

# 只插入 seed 數據
npm run deploy:setup -- --seed-only
```

### **Vercel 部署**

```bash
# 生產環境部署
npm run deploy:vercel

# 預覽環境部署
npm run deploy:staging
```

---

## 🧪 **測試系統**

### **單元測試**

```bash
# 運行所有測試
npm test

# 監視模式
npm run test:watch

# 生成覆蓋率報告
npm run test:coverage

# CI 環境測試
npm run test:ci
```

### **E2E 測試**

```bash
# 運行 E2E 測試
npm run test:e2e

# 使用 UI 模式
npm run test:e2e:ui

# 調試模式
npm run test:e2e:debug

# 查看測試報告
npm run test:e2e:report
```

---

## 📊 **SLO 監控系統**

### **SLO 配置**

Tool Zoo 包含兩個預設的 SLO 配置：

#### **1. 服務可用性 SLO**
- **目標**: 99.9% 可用性
- **監控窗口**: 1小時滾動窗口
- **警報閾值**: 警告 80%, 嚴重 95%

#### **2. API 性能 SLO**
- **目標**: 99.5% 可用性, <1000ms 響應時間, <2% 錯誤率
- **監控窗口**: 30分鐘滾動窗口
- **警報閾值**: 警告 80%, 嚴重 95%

### **SLO 監控功能**

- ✅ **實時指標收集**
- ✅ **自動警報系統**
- ✅ **合規性報告**
- ✅ **性能趨勢分析**
- ✅ **多級通知系統**

---

## 🔧 **部署架構**

### **技術棧**

```
前端: Next.js 15 + React 19 + TypeScript
部署: Vercel
數據庫: Supabase (PostgreSQL)
支付: Stripe
監控: 自建 SLO 系統
測試: Jest + Playwright
```

### **環境配置**

#### **開發環境**
```bash
# 本地開發
npm run dev

# 健康檢查
npm run health-check
```

#### **生產環境**
```bash
# 環境變數
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

---

## 📋 **部署檢查清單**

### **部署前檢查**

- [ ] **環境變數設置**
  - [ ] Supabase URL 和密鑰
  - [ ] Stripe 密鑰和 Webhook
  - [ ] 其他 API 密鑰

- [ ] **數據庫準備**
  - [ ] Schema 部署
  - [ ] Seed 數據插入
  - [ ] RLS 策略設置

- [ ] **代碼質量**
  - [ ] TypeScript 類型檢查通過
  - [ ] ESLint 檢查通過
  - [ ] 單元測試通過

- [ ] **功能測試**
  - [ ] E2E 測試通過
  - [ ] 手動功能驗證
  - [ ] 性能測試通過

### **部署後驗證**

- [ ] **健康檢查**
  - [ ] 網站可訪問
  - [ ] API 端點正常
  - [ ] 數據庫連接正常

- [ ] **功能驗證**
  - [ ] 用戶註冊/登入
  - [ ] 核心功能正常
  - [ ] 支付流程正常

- [ ] **監控設置**
  - [ ] SLO 監控啟動
  - [ ] 警報系統配置
  - [ ] 日誌收集正常

---

## 🚨 **監控和警報**

### **SLO 監控指標**

#### **可用性監控**
- **目標**: 99.9%
- **測量**: 成功請求 / 總請求
- **警報**: <99% 警告, <95% 嚴重

#### **響應時間監控**
- **目標**: <500ms (API), <1000ms (頁面)
- **測量**: 平均響應時間
- **警報**: >800ms 警告, >1200ms 嚴重

#### **錯誤率監控**
- **目標**: <1%
- **測量**: 錯誤請求 / 總請求
- **警報**: >2% 警告, >5% 嚴重

### **警報通知**

- **Email 通知**: 配置管理員郵箱
- **Webhook 通知**: 集成到 Slack/Discord
- **SMS 通知**: 緊急情況短信提醒

---

## 🔄 **CI/CD 流程**

### **自動化流程**

```yaml
# GitHub Actions 示例
name: Deploy Tool Zoo

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run deploy:vercel
```

---

## 📈 **性能基準**

### **目標指標**

#### **頁面加載性能**
- **首屏渲染**: <1.5秒
- **完全加載**: <3秒
- **Lighthouse 分數**: >90

#### **API 性能**
- **平均響應時間**: <500ms
- **P95 響應時間**: <1000ms
- **P99 響應時間**: <2000ms

#### **數據庫性能**
- **查詢響應時間**: <100ms
- **連接池使用率**: <80%
- **慢查詢數量**: <1%

### **監控工具**

- **前端性能**: Lighthouse, Web Vitals
- **API 性能**: 自建 SLO 系統
- **數據庫性能**: Supabase Analytics
- **用戶體驗**: 自建 UX 追蹤

---

## 🛠️ **故障排除**

### **常見問題**

#### **部署失敗**
```bash
# 檢查環境變數
echo $NEXT_PUBLIC_SUPABASE_URL

# 檢查構建日誌
npm run build

# 檢查依賴
npm ci
```

#### **測試失敗**
```bash
# 清理測試緩存
npm run test -- --clearCache

# 重新安裝依賴
rm -rf node_modules && npm install

# 檢查測試環境
npm run test:e2e:debug
```

#### **監控異常**
```bash
# 檢查 SLO 配置
# 查看監控日誌
# 驗證警報設置
```

---

## 📚 **文檔和資源**

### **相關文檔**
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Vercel 文檔](https://vercel.com/docs)
- [Supabase 文檔](https://supabase.com/docs)
- [Playwright 測試指南](https://playwright.dev/docs/intro)

### **支持渠道**
- **技術支持**: GitHub Issues
- **部署問題**: Vercel Support
- **數據庫問題**: Supabase Support
- **支付問題**: Stripe Support

---

## 🎯 **最佳實踐**

### **部署最佳實踐**
1. **環境分離**: 開發、測試、生產環境分離
2. **版本控制**: 使用 Git 標籤管理版本
3. **回滾策略**: 準備快速回滾方案
4. **監控先行**: 部署前確保監控就緒

### **測試最佳實踐**
1. **測試金字塔**: 單元測試 > 集成測試 > E2E 測試
2. **測試數據**: 使用隔離的測試數據
3. **並行執行**: 最大化測試執行效率
4. **持續改進**: 定期更新測試用例

### **監控最佳實踐**
1. **SLO 優先**: 基於業務目標設置 SLO
2. **警報分級**: 避免警報疲勞
3. **趨勢分析**: 關注長期趨勢而非單點異常
4. **自動化響應**: 實現自動化故障恢復

---

**Tool Zoo 現在具備了完整的企業級部署和測試能力！** 🚀

