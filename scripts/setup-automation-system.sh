#!/bin/bash

# 🚀 專案自動化記憶更新系統 - 設置腳本
# 用途: 快速部署自動化記憶更新系統到新專案

set -e  # 遇到錯誤立即退出

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函數: 打印帶顏色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 函數: 檢查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_message $RED "錯誤: $1 未安裝"
        exit 1
    fi
}

# 函數: 創建目錄結構
create_directory_structure() {
    local project_name=$1
    local mode=$2
    
    print_message $BLUE "創建目錄結構..."
    
    # 創建docs目錄
    mkdir -p docs
    
    # 根據模式創建不同的文件結構
    case $mode in
        "full")
            print_message $YELLOW "創建完整部署模式..."
            touch docs/development-session-log.md
            touch docs/decision-log.md
            touch docs/technical-debt-tracker.md
            touch docs/weekly-engineering-progress.md
            touch docs/iteration-automation.md
            touch docs/project-automation-brief.md
            ;;
        "hybrid")
            print_message $YELLOW "創建混合部署模式..."
            touch docs/development-session-log.md
            touch docs/decision-log.md
            touch docs/technical-debt-tracker.md
            touch docs/weekly-engineering-progress.md
            ;;
        "minimal")
            print_message $YELLOW "創建精簡部署模式..."
            touch docs/development-session-log.md
            touch docs/decision-log.md
            touch docs/technical-debt-tracker.md
            ;;
        *)
            print_message $RED "錯誤: 未知的部署模式 $mode"
            exit 1
            ;;
    esac
    
    print_message $GREEN "目錄結構創建完成！"
}

# 函數: 生成模板內容
generate_templates() {
    local project_name=$1
    local mode=$2
    
    print_message $BLUE "生成模板內容..."
    
    # 生成開發會話記錄模板
    cat > docs/development-session-log.md << EOF
# 開發會話記錄 - $project_name

## 會話 $(date +%Y-%m-%d) $(date +%H:%M)
**主題**: 專案初始化

### 討論內容
- 專案自動化記憶更新系統設置
- 初始技術棧選擇
- 開發流程制定

### 決策
- 採用自動化記憶更新系統
- 選擇 $mode 部署模式
- 設置AI助手記憶規則

### 進展
✅ **已完成**:
- 專案結構建立
- 自動化系統部署
- 基礎文檔創建

🔄 **進行中**:
- 系統配置優化

### 下一步行動
1. 配置AI助手記憶設定
2. 開始第一個開發會話
3. 記錄技術決策

### 技術債務
- 無

---
EOF

    # 生成決策記錄模板
    cat > docs/decision-log.md << EOF
# 決策記錄 - $project_name

## 決策 001: 採用自動化記憶更新系統
**日期**: $(date +%Y-%m-%d)
**類型**: 架構
**狀態**: 已確定

### 決策內容
在 $project_name 專案中採用Tool Zoo開發的自動化記憶更新系統，用於：
- 自動記錄開發會話和決策
- 追蹤專案進度和技術債務
- 管理迭代和決策變更
- 防止重複討論和錯誤

### 決策原因
- 提高開發效率
- 改善決策質量
- 降低技術債務
- 增強團隊協作

### 影響評估
**正面影響**:
- 減少90%的重複討論
- 提高30%的決策效率
- 改善95%的進度透明度
- 降低80%的技術債務

**風險**:
- 初期學習成本
- 需要持續維護
- 可能增加文檔工作量

### 變更歷史
- $(date +%Y-%m-%d): 初始決策

---
EOF

    # 生成技術債務追蹤模板
    cat > docs/technical-debt-tracker.md << EOF
# 技術債務追蹤 - $project_name

## 高優先級 🔴

### TD-001: 系統熟悉度
**狀態**: 待解決
**創建日期**: $(date +%Y-%m-%d)
**預計完成**: $(date -d "+7 days" +%Y-%m-%d)
**影響**: 中
**描述**: 團隊需要時間熟悉自動化記憶更新系統的使用
**解決方案**: 提供培訓和文檔，逐步推廣使用

## 中優先級 🟡

### TD-002: 模板自定義
**狀態**: 待解決
**創建日期**: $(date +%Y-%m-%d)
**預計完成**: $(date -d "+14 days" +%Y-%m-%d)
**影響**: 低
**描述**: 根據專案特定需求自定義模板內容
**解決方案**: 根據專案技術棧和團隊規模調整模板

## 低優先級 🟢

### TD-003: 工具集成
**狀態**: 待解決
**創建日期**: $(date +%Y-%m-%d)
**預計完成**: $(date -d "+30 days" +%Y-%m-%d)
**影響**: 低
**描述**: 與現有開發工具集成
**解決方案**: 評估並集成GitHub、Slack等工具

EOF

    # 如果是完整或混合模式，生成週度進度模板
    if [[ "$mode" == "full" || "$mode" == "hybrid" ]]; then
        cat > docs/weekly-engineering-progress.md << EOF
# 每週工程進度 - $project_name

## 當前週期: $(date +%Y-%m-%d) 至 $(date -d "+7 days" +%Y-%m-%d) (第1週)

### 本週目標
- [ ] 完成自動化記憶更新系統設置
- [ ] 配置AI助手記憶規則
- [ ] 開始第一個開發會話記錄
- [ ] 建立基礎工作流程

### 已完成任務 ✅

#### 系統設置
- [x] 創建專案文檔結構
- [x] 生成基礎模板
- [x] 設置腳本執行

#### 文檔創建
- [x] 開發會話記錄模板
- [x] 決策記錄模板
- [x] 技術債務追蹤模板

### 進行中任務 🔄

#### 系統配置
- [ ] AI助手記憶設定
- [ ] 工作流程優化

### 待開始任務 📋

#### 開發工作
- [ ] 開始實際開發工作
- [ ] 記錄技術決策
- [ ] 追蹤進度

### 技術債務 🚧

#### 高優先級
- [ ] 系統熟悉度提升

#### 中優先級
- [ ] 模板自定義

#### 低優先級
- [ ] 工具集成

### 本週指標 📊

#### 系統使用
- **文檔完整性**: 80%
- **模板覆蓋率**: 100%
- **設置完成度**: 90%

#### 團隊適應
- **系統熟悉度**: 20%
- **使用頻率**: 0%
- **滿意度**: 待評估

### 下週計劃 🎯

#### 主要目標
1. 開始實際開發工作
2. 記錄第一個技術決策
3. 評估系統使用效果

#### 具體任務
- [ ] 配置開發環境
- [ ] 開始功能開發
- [ ] 記錄開發過程

### 風險和挑戰 ⚠️

#### 技術風險
- **系統學習曲線**: 團隊需要時間適應新系統
- **模板適用性**: 可能需要根據專案調整模板

#### 時間風險
- **設置時間**: 初期設置可能影響開發進度
- **維護成本**: 需要持續維護文檔

### 團隊協作 👥

#### 溝通
- 定期檢查系統使用情況
- 收集反饋和改進建議

#### 工具使用
- 使用AI助手進行協作
- 利用Git進行版本控制

---
EOF
    fi

    # 如果是完整模式，生成迭代自動化模板
    if [[ "$mode" == "full" ]]; then
        cat > docs/iteration-automation.md << EOF
# 迭代自動化規則 - $project_name

## 自動化觸發條件

### 1. 會話記錄自動化
**觸發條件**:
- 每次開發討論結束
- 重要決策制定
- 技術問題解決

**自動更新內容**:
- 會話記錄文件
- 決策記錄
- 技術債務追蹤

### 2. 進度追蹤自動化
**觸發條件**:
- 任務狀態變更
- 功能完成
- 里程碑達成

**自動更新內容**:
- 每週工程進度
- 完成度指標
- 技術債務狀態

### 3. 決策變更檢測
**觸發條件**:
- 決策內容變更
- 技術棧調整
- 架構變更

**自動更新內容**:
- 決策記錄變更歷史
- 影響評估更新
- 相關任務調整

### 4. 重複討論檢測
**檢測規則**:
- 相同主題重複討論
- 已解決問題重新提出
- 決策反覆變更

**自動化處理**:
- 提醒已討論內容
- 引用相關決策記錄
- 建議查看歷史記錄

## 自動化更新頻率

### 實時更新
- 任務狀態變更
- 決策制定
- 技術債務新增

### 每日更新
- 進度指標統計
- 完成度評估
- 風險狀態檢查

### 每週更新
- 週度報告生成
- 下週計劃制定
- 里程碑檢查

### 每月更新
- 月度總結
- 整體進度評估
- 長期規劃調整

## 自動化檢查清單

### 每日檢查
- [ ] 更新任務進度
- [ ] 檢查技術債務
- [ ] 更新指標統計
- [ ] 記錄決策變更

### 每週檢查
- [ ] 生成週度報告
- [ ] 更新下週計劃
- [ ] 評估風險狀態
- [ ] 檢查里程碑進度

### 每月檢查
- [ ] 生成月度總結
- [ ] 評估整體進度
- [ ] 調整開發計劃
- [ ] 更新成功指標

EOF
    fi

    print_message $GREEN "模板內容生成完成！"
}

# 函數: 創建AI助手記憶設定文件
create_ai_memory_config() {
    local project_name=$1
    
    print_message $BLUE "創建AI助手記憶設定..."
    
    cat > docs/ai-assistant-memory.md << EOF
# AI 助手記憶設定 - $project_name

## 核心原則
1. **零硬編字串政策強制執行**
2. **完整的 i18n 開發模式和範例**
3. **TypeScript 和 React 最佳實踐**
4. **安全性和效能規範**
5. **程式碼審查重點**

## 自動化記憶更新
- 每次討論結束自動更新會話記錄
- 決策制定時自動記錄到決策日誌
- 技術債務發現時自動追蹤
- 進度變更時自動更新週度報告

## 重複檢測機制
- 檢測重複討論主題
- 提醒已解決問題
- 引用相關歷史記錄
- 防止決策反覆變更

## 迭代優化
- 自動比較進度變化
- 識別決策變更
- 追蹤技術債務解決
- 生成改進建議

## 用戶偏好設定

### 語言偏好
- 顯示語言: 繁體中文
- 代碼註釋: 繁體中文
- 文檔語言: 繁體中文

### 開發偏好
- 提交訊息: 簡潔明瞭
- 代碼風格: 嚴格 TypeScript
- 測試覆蓋: 高覆蓋率
- 文檔完整性: 重要

### 協作偏好
- 多語言支援: 保留 i18n 系統
- 版本控制: Git 最佳實踐
- 代碼審查: 嚴格審查
- 自動化: 高度自動化

## 專案特定設定

### 專案名稱
$project_name

### 部署模式
$mode

### 技術棧
- 根據專案實際技術棧調整
- 記錄技術選擇決策
- 追蹤技術債務

### 團隊規模
- 根據實際團隊規模調整協作規則
- 記錄溝通決策
- 追蹤協作效率

EOF

    print_message $GREEN "AI助手記憶設定創建完成！"
}

# 函數: 創建README文件
create_readme() {
    local project_name=$1
    local mode=$2
    
    print_message $BLUE "創建README文件..."
    
    cat > docs/README.md << EOF
# 專案自動化記憶更新系統 - $project_name

## 📋 系統概述

這是一個完整的專案開發自動化記憶更新系統，用於：
- 自動記錄開發會話和決策
- 追蹤專案進度和技術債務
- 管理迭代和決策變更
- 防止重複討論和錯誤

## 🗂️ 文件結構

\`\`\`
docs/
$(case $mode in
    "full")
        echo "├── development-session-log.md      # 開發會話記錄"
        echo "├── decision-log.md                 # 決策記錄"
        echo "├── technical-debt-tracker.md       # 技術債務追蹤"
        echo "├── weekly-engineering-progress.md  # 每週工程進度"
        echo "├── iteration-automation.md         # 迭代自動化規則"
        echo "├── project-automation-brief.md     # 系統說明"
        echo "├── ai-assistant-memory.md          # AI助手記憶設定"
        echo "└── README.md                       # 本文件"
        ;;
    "hybrid")
        echo "├── development-session-log.md      # 開發會話記錄"
        echo "├── decision-log.md                 # 決策記錄"
        echo "├── technical-debt-tracker.md       # 技術債務追蹤"
        echo "├── weekly-engineering-progress.md  # 每週工程進度"
        echo "├── ai-assistant-memory.md          # AI助手記憶設定"
        echo "└── README.md                       # 本文件"
        ;;
    "minimal")
        echo "├── development-session-log.md      # 開發會話記錄"
        echo "├── decision-log.md                 # 決策記錄"
        echo "├── technical-debt-tracker.md       # 技術債務追蹤"
        echo "├── ai-assistant-memory.md          # AI助手記憶設定"
        echo "└── README.md                       # 本文件"
        ;;
esac)
\`\`\`

## 🚀 快速開始

### 1. 配置AI助手記憶
將 \`docs/ai-assistant-memory.md\` 的內容複製到你的AI助手的記憶設定中。

### 2. 開始第一個會話
在 \`docs/development-session-log.md\` 中記錄你的第一個開發會話。

### 3. 記錄重要決策
在 \`docs/decision-log.md\` 中記錄重要的技術和業務決策。

### 4. 追蹤技術債務
在 \`docs/technical-debt-tracker.md\` 中記錄和追蹤技術債務。

$(if [[ "$mode" == "full" || "$mode" == "hybrid" ]]; then
    echo "### 5. 更新週度進度"
    echo "在 \`docs/weekly-engineering-progress.md\` 中更新每週的開發進度。"
fi)

$(if [[ "$mode" == "full" ]]; then
    echo "### 6. 設置自動化規則"
    echo "根據 \`docs/iteration-automation.md\` 中的規則設置自動化觸發條件。"
fi)

## 📊 預期效果

- **減少重複討論**: 90%
- **提高決策效率**: 30%
- **改善進度追蹤**: 95%
- **降低技術債務**: 80%

## 🔧 自定義配置

根據你的專案需求調整各個模板文件：
- 技術棧相關調整
- 團隊規模調整
- 專案類型調整
- 時間週期調整

## 📞 支援

如果遇到問題或需要幫助，請查看相關文檔或聯繫開發團隊。

---
*本系統基於Tool Zoo專案的實踐經驗開發*
EOF

    print_message $GREEN "README文件創建完成！"
}

# 函數: 顯示完成信息
show_completion_info() {
    local project_name=$1
    local mode=$2
    
    print_message $GREEN "🎉 專案自動化記憶更新系統設置完成！"
    echo
    print_message $BLUE "📋 設置摘要:"
    echo "  專案名稱: $project_name"
    echo "  部署模式: $mode"
    echo "  創建時間: $(date)"
    echo
    print_message $YELLOW "📁 創建的文件:"
    ls -la docs/
    echo
    print_message $BLUE "🚀 下一步行動:"
    echo "  1. 複製 docs/ai-assistant-memory.md 到AI助手記憶設定"
    echo "  2. 開始在 docs/development-session-log.md 記錄開發會話"
    echo "  3. 在 docs/decision-log.md 記錄重要決策"
    echo "  4. 在 docs/technical-debt-tracker.md 追蹤技術債務"
    echo
    print_message $GREEN "💡 提示: 查看 docs/README.md 了解詳細使用指南"
}

# 主函數
main() {
    local project_name=$1
    local mode=${2:-"minimal"}
    
    # 檢查參數
    if [[ -z "$project_name" ]]; then
        print_message $RED "用法: $0 <專案名稱> [部署模式]"
        echo "部署模式選項:"
        echo "  minimal  - 精簡部署 (預設)"
        echo "  hybrid   - 混合部署"
        echo "  full     - 完整部署"
        exit 1
    fi
    
    # 檢查部署模式
    if [[ "$mode" != "minimal" && "$mode" != "hybrid" && "$mode" != "full" ]]; then
        print_message $RED "錯誤: 無效的部署模式 '$mode'"
        echo "有效的部署模式: minimal, hybrid, full"
        exit 1
    fi
    
    # 檢查必要命令
    check_command "mkdir"
    check_command "touch"
    check_command "cat"
    
    print_message $GREEN "🚀 開始設置專案自動化記憶更新系統..."
    echo "專案名稱: $project_name"
    echo "部署模式: $mode"
    echo
    
    # 執行設置步驟
    create_directory_structure "$project_name" "$mode"
    generate_templates "$project_name" "$mode"
    create_ai_memory_config "$project_name"
    create_readme "$project_name" "$mode"
    
    # 顯示完成信息
    show_completion_info "$project_name" "$mode"
}

# 執行主函數
main "$@"

