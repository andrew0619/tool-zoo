---
title: Flagship Proof‑of‑Work → Product‑grade Proposal (for AI Founders)
status: exploring
gate: 2025-10-31
agents: [Supervisor, PM, Dev, PR]
---

Context
- Audience: AI 創業者（重視 Time‑to‑Revenue、可靠性、觀測、可維運）。
- Principle: 不做樣品，要能「可賣、可維運、可被信任」。

Primary signals（to pick 2 later）
- 延遲/可用性（p95、錯誤率）
- 成本/1000 請求（或每用戶）
- 轉換/ARR（付費關鍵轉化）
- 評測/對照框架（eval/ablation）

Option A — Entitlements Sandbox（Stripe × Supabase）
- 多租戶 RLS/Policies 正確；Stripe webhook 簽章驗證＋冪等鍵＋重試策略
- 權限雙軌：後端中介層＋前端 feature gates；離線不越權
- 一鍵部署模板（Fly/Vercel/Supabase）＋遷移腳本＋seed
- 觀測：付款→權限生效 p95、錯誤率、重試率；Sentry/PostHog 事件
- 成本/合規：測試/實際分流；退款/稅務示例
- DX：README 5min 起步、Cookbook、e2e、示例（Next/Expo）

Option B — JSON‑AI Salvage Kit（非規範輸出自救）
- JSON Schema/grammar、函數呼叫、分級 salvage（strip fence/brace match/AST 修復）
- re‑ask 策略（min‑delta）＋成本上限
- 量測：成功率、每百請求成本、平均補問次數；錯誤分類（syntax/shape/semantic）
- 對照：naive baseline 與 kit 對比報告
- SDK：TS 客戶端、Node 中介、Edge 函數範例；失敗熱點儀表板

Option C — nutrivise‑ai Pipeline Dashboard
- 端到端 p95/成功率/成本（提取→分析→回覆），per‑model 比較
- 快取：條碼/圖片特徵快取、去重；冷/熱命中率
- 風控：速率限制/配額、PII/PHI 遮罩、審計日誌
- Eval 小型標註集＋回歸測試；改版前後曲線
- 案例頁：用戶路徑＋數據＋學到的 trade‑offs

Raise the bar（共通加分項）
- 一鍵部署 + 觀測 + eval 三件套（IaC/架構圖/SLO 標準/測試資料集/Playbook）
- 公開基準：與 naive 對照表與圖；可重現
- 跨圈背書 ≥ 2（創業者/設計總監/學者 任兩）

Decisions pending（不立刻行動）
- 主題：A / B / C（擇一為旗艦，餘為副線）
- 主打訊號：延遲/可用性｜成本/1000｜轉換/ARR｜評測框架（挑 2）
- 背書對象：人名/機構 2 位

Notes
- 本文件為討論底稿，未標記 committed 前不會轉為待辦或日程。

