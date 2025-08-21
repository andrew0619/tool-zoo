# Tool Zoo

AI創業者的一盒化解決方案 - 單人友好、意見強、開箱有SLO與E2E、內含前/後對照Dashboard

## 🚀 快速開始

### 環境要求
- Node.js 18+
- npm 或 yarn

### 安裝依賴
```bash
cd tool-zoo
npm install
```

### 環境變數設置
複製 `.env.example` 到 `.env.local` 並填入你的配置：

```bash
cp .env.example .env.local
```

#### Supabase 配置
1. 前往 [Supabase](https://supabase.com) 創建新專案
2. 在專案設置中獲取以下資訊：
   - Project URL
   - Anon Key
3. 更新 `.env.local`：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 數據庫設置
1. 在 Supabase Dashboard 中打開 SQL Editor
2. 執行 `supabase/schema.sql` 中的 SQL 腳本
3. 這將創建所有必要的表、索引和 RLS 策略

#### Stripe 配置 (可選)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 啟動開發服務器
```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000) 查看應用。

## 🏗️ 專案結構

```
tool-zoo/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React 組件
│   │   └── auth/           # 認證相關組件
│   ├── lib/                # 工具函數和配置
│   └── types/              # TypeScript 類型定義
├── supabase/               # Supabase 配置
│   └── schema.sql          # 數據庫 schema
└── docs/                   # 專案文檔
```

## 🔧 核心功能

### 1. Entitlements Sandbox
- 多租戶權限管理
- Stripe 整合
- RLS 安全策略

### 2. JSON-AI Salvage Kit
- AI 輸出格式修復
- JSON Schema 驗證
- 分級修復策略

### 3. Pipeline Dashboard
- AI Pipeline 監控
- 端到端性能追蹤
- 成本分析

## 🛠️ 技術棧

- **前端**: Next.js 15, React 19, TypeScript
- **樣式**: TailwindCSS
- **後端**: Supabase (PostgreSQL, Auth, RLS)
- **支付**: Stripe
- **狀態管理**: React Query
- **部署**: Vercel

## 📚 文檔

- [開發指南](./docs/DEVELOPMENT.md)
- [技術詞彙表](./docs/technical-glossary.md)
- [概念說明](./docs/concept.md)
- [每週進度追蹤](./docs/weekly-engineering-progress.md)

## 🤝 貢獻

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權 - 查看 [LICENSE](LICENSE) 檔案了解詳情。
