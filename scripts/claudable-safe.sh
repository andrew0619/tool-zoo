#!/bin/bash

# Claudable 安全工作流程腳本
# 用於安全地使用 Claudable 進行 UI 改進

set -e

echo "🔒 Claudable 安全工作流程啟動"
echo "=================================="

# 檢查是否在正確的目錄
if [ ! -f ".claudable-ignore" ]; then
    echo "❌ 錯誤：請在 Tool-Zoo 項目根目錄執行此腳本"
    exit 1
fi

# 創建 UI 開發分支
BRANCH_NAME="ui/claudable-improvements-$(date +%Y%m%d-%H%M%S)"
echo "🌿 創建新分支: $BRANCH_NAME"

git checkout -b "$BRANCH_NAME"

# 檢查保護文件
echo "🔍 檢查保護文件..."
if [ -f ".claudable-ignore" ]; then
    echo "✅ .claudable-ignore 文件存在"
else
    echo "❌ .claudable-ignore 文件缺失"
    exit 1
fi

# 顯示可修改的文件
echo "📝 Claudable 可以修改的文件："
echo "   - src/app/ (頁面組件)"
echo "   - src/components/ (UI 組件)"
echo "   - src/app/globals.css (全局樣式)"
echo "   - public/ (靜態資源)"

# 顯示保護的文件
echo "🛡️ 保護的文件："
while IFS= read -r line; do
    if [[ ! "$line" =~ ^# ]] && [[ -n "$line" ]]; then
        echo "   - $line"
    fi
done < .claudable-ignore

echo ""
echo "🚀 準備就緒！"
echo "=================================="
echo "下一步："
echo "1. 在 Claudable 中輸入你的 UI 改進需求"
echo "2. 確保 Claudable 只修改允許的文件"
echo "3. 測試修改後的 UI"
echo "4. 提交更改：git add . && git commit -m 'UI improvements'"
echo "5. 合併到主分支：git checkout main && git merge $BRANCH_NAME"
echo ""
echo "⚠️  注意：請確保 Claudable 不會修改保護的文件！"
