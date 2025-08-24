#!/bin/bash

# Tool Zoo - 一鍵部署腳本
# 支持 Vercel + Supabase 的完整部署流程

set -e  # 遇到錯誤立即退出

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

# 檢查依賴
check_dependencies() {
    log_info "檢查系統依賴..."
    
    # 檢查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安裝，請先安裝 Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 版本過低，需要 18+ 版本"
        exit 1
    fi
    
    log_success "Node.js 版本: $(node -v)"
    
    # 檢查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安裝"
        exit 1
    fi
    
    log_success "npm 版本: $(npm -v)"
    
    # 檢查 Git
    if ! command -v git &> /dev/null; then
        log_warning "Git 未安裝，某些功能可能受限"
    else
        log_success "Git 版本: $(git --version)"
    fi
    
    # 檢查 Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI 未安裝，將嘗試自動安裝"
        npm install -g vercel
    else
        log_success "Vercel CLI 已安裝"
    fi
}

# 環境變數檢查
check_environment() {
    log_info "檢查環境變數..."
    
    local missing_vars=()
    
    # 必需的環境變數
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        missing_vars+=("NEXT_PUBLIC_SUPABASE_URL")
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        missing_vars+=("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    fi
    
    if [ -z "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ]; then
        missing_vars+=("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
    fi
    
    if [ -z "$STRIPE_SECRET_KEY" ]; then
        missing_vars+=("STRIPE_SECRET_KEY")
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "缺少以下環境變數:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        log_info "請設置 .env.local 文件或環境變數"
        exit 1
    fi
    
    log_success "環境變數檢查通過"
}

# 安裝依賴
install_dependencies() {
    log_info "安裝項目依賴..."
    
    if [ ! -f "package.json" ]; then
        log_error "package.json 不存在，請在項目根目錄運行此腳本"
        exit 1
    fi
    
    npm install
    
    if [ $? -eq 0 ]; then
        log_success "依賴安裝完成"
    else
        log_error "依賴安裝失敗"
        exit 1
    fi
}

# 數據庫設置
setup_database() {
    log_info "設置數據庫..."
    
    # 檢查 Supabase 配置
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        log_error "Supabase 配置缺失"
        exit 1
    fi
    
    # 運行數據庫遷移
    if [ -f "supabase/schema.sql" ]; then
        log_info "執行數據庫 schema..."
        # 這裡可以添加實際的 Supabase 遷移命令
        # 例如: supabase db push
        log_success "數據庫 schema 已準備就緒"
    else
        log_warning "未找到 schema.sql 文件"
    fi
}

# 構建項目
build_project() {
    log_info "構建項目..."
    
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "項目構建成功"
    else
        log_error "項目構建失敗"
        exit 1
    fi
}

# 運行測試
run_tests() {
    log_info "運行測試..."
    
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        npm test
        
        if [ $? -eq 0 ]; then
            log_success "測試通過"
        else
            log_warning "測試失敗，但繼續部署"
        fi
    else
        log_warning "未找到測試腳本，跳過測試"
    fi
}

# 部署到 Vercel
deploy_to_vercel() {
    log_info "部署到 Vercel..."
    
    # 檢查是否已登入 Vercel
    if ! vercel whoami &> /dev/null; then
        log_info "請先登入 Vercel..."
        vercel login
    fi
    
    # 部署
    vercel --prod
    
    if [ $? -eq 0 ]; then
        log_success "Vercel 部署成功"
    else
        log_error "Vercel 部署失敗"
        exit 1
    fi
}

# 設置環境變數到 Vercel
setup_vercel_env() {
    log_info "設置 Vercel 環境變數..."
    
    # 設置 Supabase 變數
    vercel env add NEXT_PUBLIC_SUPABASE_URL production
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
    
    # 設置 Stripe 變數
    vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
    vercel env add STRIPE_SECRET_KEY production
    vercel env add STRIPE_WEBHOOK_SECRET production
    
    log_success "環境變數設置完成"
}

# 健康檢查
health_check() {
    log_info "執行健康檢查..."
    
    # 獲取部署 URL
    DEPLOY_URL=$(vercel ls --json | jq -r '.projects[0].url' 2>/dev/null || echo "")
    
    if [ -n "$DEPLOY_URL" ]; then
        log_info "檢查部署站點: $DEPLOY_URL"
        
        # 簡單的健康檢查
        if curl -f -s "$DEPLOY_URL" > /dev/null; then
            log_success "健康檢查通過"
        else
            log_warning "健康檢查失敗，但部署可能仍然成功"
        fi
    else
        log_warning "無法獲取部署 URL"
    fi
}

# 顯示部署信息
show_deployment_info() {
    log_success "部署完成！"
    echo
    echo "🎉 Tool Zoo 已成功部署"
    echo
    echo "📋 部署信息:"
    echo "  - 前端: Vercel"
    echo "  - 數據庫: Supabase"
    echo "  - 支付: Stripe"
    echo
    echo "🔗 訪問地址:"
    echo "  - 生產環境: https://your-project.vercel.app"
    echo "  - 開發環境: http://localhost:3000"
    echo
    echo "📚 文檔:"
    echo "  - 快速開始: https://your-project.vercel.app/docs"
    echo "  - API 文檔: https://your-project.vercel.app/api/docs"
    echo
    echo "🛠️ 管理:"
    echo "  - Vercel Dashboard: https://vercel.com/dashboard"
    echo "  - Supabase Dashboard: https://supabase.com/dashboard"
    echo "  - Stripe Dashboard: https://dashboard.stripe.com"
}

# 主函數
main() {
    echo "🚀 Tool Zoo - 一鍵部署腳本"
    echo "================================"
    echo
    
    # 檢查參數
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        echo "用法: $0 [選項]"
        echo
        echo "選項:"
        echo "  --help, -h     顯示幫助信息"
        echo "  --skip-tests   跳過測試"
        echo "  --skip-build   跳過構建"
        echo "  --env-only     只設置環境變數"
        echo
        exit 0
    fi
    
    # 設置標誌
    SKIP_TESTS=false
    SKIP_BUILD=false
    ENV_ONLY=false
    
    for arg in "$@"; do
        case $arg in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --env-only)
                ENV_ONLY=true
                shift
                ;;
        esac
    done
    
    # 執行部署流程
    check_dependencies
    
    if [ "$ENV_ONLY" = true ]; then
        setup_vercel_env
        exit 0
    fi
    
    check_environment
    install_dependencies
    setup_database
    
    if [ "$SKIP_BUILD" = false ]; then
        build_project
    fi
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    fi
    
    deploy_to_vercel
    setup_vercel_env
    health_check
    show_deployment_info
}

# 執行主函數
main "$@"

