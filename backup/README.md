# Tool Zoo 🛠️

AI創業者的一盒化解決方案 - 「單人友好、意見強、開箱有SLO與E2E、內含前/後對照Dashboard」

## 🚀 專案概述

Tool Zoo 是一個針對AI創業者的完整解決方案集合，提供「一鍵種子＋Webhook冪等＋RLS＋前端gating＋小型儀表板＋E2E」的開箱即用體驗。

## 📦 核心產品

### 1. Entitlements Sandbox
多租戶權限管理解決方案
- Stripe × Supabase 整合
- RLS Policies 正確配置
- Webhook 冪等處理
- 前端 Feature Gates

### 2. JSON-AI Salvage Kit
AI輸出格式修復工具
- JSON Schema 驗證
- 分級修復策略
- 成本優化建議
- 失敗熱點分析

### 3. Pipeline Dashboard
AI Pipeline 全流程監控
- 端到端性能監控
- 成本分析
- 用戶體驗追蹤
- 改進建議

## 🛠️ 技術架構

### Opinionated Stack
```
Next.js + Supabase + Stripe + Vercel
```

### 核心特色
- **單人友好**: 一人即可完成從原型到生產
- **意見強**: 基於實戰經驗的技術選擇
- **開箱即用**: 一鍵部署，包含SLO與E2E
- **前後對照**: 內建Dashboard，可量化改進

## 📁 專案結構

```
Tool-Zoo/
├── docs/                    # 文檔
│   ├── concept.md          # 產品概念
│   └── flagship-proposal.md # 旗艦提案
├── src/                    # 源代碼
│   ├── entitlements-sandbox/ # 權限管理
│   ├── json-ai-salvage/     # AI輸出修復
│   └── pipeline-dashboard/  # 監控儀表板
├── templates/              # 部署模板
├── examples/               # 使用範例
└── README.md
```

## 🎯 目標用戶

- **主要**: AI創業者（重視Time-to-Revenue、可靠性、觀測、可維運）
- **次要**: 獨立開發者、小型技術團隊
- **排除**: 大型企業（已有完整DevOps流程）

## 💰 變現模式

### 定價策略
- **免費層**: 基礎模板 + 文檔
- **Pro層**: $99/月，完整功能 + 支援
- **Enterprise層**: $299/月，客製化 + 專屬支援

## 🚀 快速開始

### 安裝
```bash
# 克隆專案
git clone https://github.com/your-username/tool-zoo.git
cd tool-zoo

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

### 環境變數
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## 📈 開發進度

### 已完成 ✅
- [x] 產品概念設計
- [x] 技術架構規劃
- [x] 專案結構建立

### 進行中 🔄
- [ ] Entitlements Sandbox 開發
- [ ] JSON-AI Salvage Kit 開發
- [ ] Pipeline Dashboard 開發

### 待開始 ⏳
- [ ] 文檔撰寫
- [ ] 範例應用
- [ ] 用戶測試

## 🎯 成功指標

### 技術指標
- 部署成功率 > 95%
- 用戶上手時間 < 30分鐘
- 錯誤率 < 1%

### 商業指標
- 月活躍用戶 > 1000
- 付費轉換率 > 5%
- 月收入 > $10,000

## 📝 文檔

- [產品概念](./docs/concept.md)
- [旗艦提案](./docs/flagship-proposal.md)

## 🤝 貢獻

歡迎提交Issue和Pull Request！

## 📄 授權

MIT License

