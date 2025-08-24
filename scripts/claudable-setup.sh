#!/bin/bash

# Claudable + Tool Zoo 協作環境設置腳本
# 作者: Tool Zoo 團隊
# 版本: 1.0.0

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安裝，請先安裝 $1"
        exit 1
    fi
}

# 檢查目錄是否存在
check_directory() {
    if [ ! -d "$1" ]; then
        log_error "目錄 $1 不存在"
        exit 1
    fi
}

# 主函數
main() {
    log_info "🚀 開始設置 Claudable + Tool Zoo 協作環境..."
    
    # 檢查必要工具
    log_info "檢查必要工具..."
    check_command "git"
    check_command "npm"
    check_command "node"
    
    # 獲取當前目錄
    CURRENT_DIR=$(pwd)
    log_info "當前目錄: $CURRENT_DIR"
    
    # 檢查是否在 Tool Zoo 項目中
    if [[ ! "$CURRENT_DIR" == *"Tool-Zoo"* ]]; then
        log_error "請在 Tool Zoo 項目目錄中運行此腳本"
        exit 1
    fi
    
    # 檢查分支
    CURRENT_BRANCH=$(git branch --show-current)
    if [[ "$CURRENT_BRANCH" != "feature/claudable-ui-enhancement" ]]; then
        log_warning "當前分支: $CURRENT_BRANCH"
        log_info "切換到協作分支..."
        git checkout feature/claudable-ui-enhancement
    fi
    
    # 檢查 Claudable 目錄
    CLAUDABLE_DIR="/Users/andrewchang/Desktop/Claudable"
    if [ ! -d "$CLAUDABLE_DIR" ]; then
        log_info "Claudable 目錄不存在，開始克隆..."
        cd /Users/andrewchang/Desktop
        git clone https://github.com/opactorai/Claudable.git
        cd Claudable
        npm install
        log_success "Claudable 安裝完成"
    else
        log_info "Claudable 目錄已存在"
        cd "$CLAUDABLE_DIR"
        log_info "更新 Claudable..."
        git pull origin main
        npm install
    fi
    
    # 返回 Tool Zoo 目錄
    cd "$CURRENT_DIR"
    
    # 檢查 Tool Zoo 依賴
    log_info "檢查 Tool Zoo 依賴..."
    if [ ! -d "node_modules" ]; then
        log_info "安裝 Tool Zoo 依賴..."
        npm install
    else
        log_info "更新 Tool Zoo 依賴..."
        npm install
    fi
    
    # 檢查開發服務器
    log_info "檢查開發服務器狀態..."
    if pgrep -f "next dev" > /dev/null; then
        log_warning "開發服務器已在運行"
        log_info "停止現有服務器..."
        pkill -f "next dev"
        sleep 2
    fi
    
    # 啟動開發服務器
    log_info "啟動 Tool Zoo 開發服務器..."
    npm run dev &
    TOOL_ZOO_PID=$!
    
    # 等待服務器啟動
    log_info "等待服務器啟動..."
    sleep 5
    
    # 檢查服務器狀態
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "Tool Zoo 服務器啟動成功 (http://localhost:3000)"
    elif curl -s http://localhost:3001 > /dev/null 2>&1; then
        log_success "Tool Zoo 服務器啟動成功 (http://localhost:3001)"
    else
        log_error "Tool Zoo 服務器啟動失敗"
        exit 1
    fi
    
    # 啟動 Claudable
    log_info "啟動 Claudable..."
    cd "$CLAUDABLE_DIR"
    npm run dev &
    CLAUDABLE_PID=$!
    
    # 等待 Claudable 啟動
    sleep 3
    
    # 檢查 Claudable 狀態
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "Claudable 啟動成功 (http://localhost:3000)"
    else
        log_warning "Claudable 可能在其他端口運行"
    fi
    
    # 返回 Tool Zoo 目錄
    cd "$CURRENT_DIR"
    
    # 顯示協作信息
    echo ""
    log_success "🎉 協作環境設置完成！"
    echo ""
    echo "📋 協作信息:"
    echo "  • Tool Zoo: http://localhost:3000 (或 3001)"
    echo "  • Claudable: http://localhost:3000 (或檢查其他端口)"
    echo "  • 分支: feature/claudable-ui-enhancement"
    echo ""
    echo "🛠️  可用命令:"
    echo "  • npm run test:website    # 運行網站測試"
    echo "  • npm run health-check    # 健康檢查"
    echo "  • npm run type-check      # 類型檢查"
    echo "  • npm run lint:fix        # 代碼格式化"
    echo ""
    echo "📚 文檔:"
    echo "  • 協作指南: docs/claudable-collaboration-guide.md"
    echo "  • 測試指南: docs/testing-guide.md"
    echo "  • 檢查清單: TESTING_CHECKLIST.md"
    echo ""
    echo "🚨 注意事項:"
    echo "  • 請在 Claudable 中創建新項目進行 UI 改進"
    echo "  • 生成的代碼請手動複製到 Tool Zoo 項目"
    echo "  • 每次更改後請運行測試驗證"
    echo "  • 重要更改請提交到 Git"
    echo ""
    
    # 保存進程 ID
    echo $TOOL_ZOO_PID > .tool-zoo-pid
    echo $CLAUDABLE_PID > .claudable-pid
    
    log_info "進程 ID 已保存到 .tool-zoo-pid 和 .claudable-pid"
    log_info "使用 ./scripts/claudable-stop.sh 停止服務器"
}

# 清理函數
cleanup() {
    log_info "清理進程..."
    if [ -f ".tool-zoo-pid" ]; then
        kill $(cat .tool-zoo-pid) 2>/dev/null || true
        rm .tool-zoo-pid
    fi
    if [ -f ".claudable-pid" ]; then
        kill $(cat .claudable-pid) 2>/dev/null || true
        rm .claudable-pid
    fi
    pkill -f "next dev" 2>/dev/null || true
}

# 設置信號處理
trap cleanup EXIT
trap cleanup SIGINT
trap cleanup SIGTERM

# 運行主函數
main "$@"
