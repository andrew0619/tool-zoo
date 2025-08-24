#!/bin/bash

# Claudable + Tool Zoo 協作環境停止腳本
# 作者: Tool Zoo 團隊
# 版本: 1.0.0

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

# 停止進程函數
stop_process() {
    local pid_file=$1
    local process_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log_info "停止 $process_name (PID: $pid)..."
            kill "$pid"
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                log_warning "強制停止 $process_name..."
                kill -9 "$pid"
            fi
            log_success "$process_name 已停止"
        else
            log_warning "$process_name 進程不存在"
        fi
        rm -f "$pid_file"
    else
        log_warning "$pid_file 不存在"
    fi
}

# 主函數
main() {
    log_info "🛑 停止 Claudable + Tool Zoo 協作環境..."
    
    # 停止 Tool Zoo 服務器
    stop_process ".tool-zoo-pid" "Tool Zoo 服務器"
    
    # 停止 Claudable 服務器
    stop_process ".claudable-pid" "Claudable 服務器"
    
    # 停止所有 Next.js 開發服務器
    log_info "停止所有 Next.js 開發服務器..."
    pkill -f "next dev" 2>/dev/null || true
    
    # 檢查是否還有相關進程
    if pgrep -f "next dev" > /dev/null; then
        log_warning "仍有 Next.js 進程運行，強制停止..."
        pkill -9 -f "next dev" 2>/dev/null || true
    fi
    
    # 檢查端口使用情況
    log_info "檢查端口使用情況..."
    if lsof -ti:3000 > /dev/null 2>&1; then
        log_warning "端口 3000 仍被佔用"
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    fi
    
    if lsof -ti:3001 > /dev/null 2>&1; then
        log_warning "端口 3001 仍被佔用"
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    fi
    
    log_success "🎉 協作環境已停止！"
    
    echo ""
    echo "📋 清理完成:"
    echo "  • Tool Zoo 服務器已停止"
    echo "  • Claudable 服務器已停止"
    echo "  • 所有 Next.js 進程已清理"
    echo "  • 端口已釋放"
    echo ""
    echo "🔄 重新啟動:"
    echo "  • ./scripts/claudable-setup.sh"
    echo ""
}

# 運行主函數
main "$@"
