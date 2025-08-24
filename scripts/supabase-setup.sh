#!/bin/bash

# Tool Zoo - Supabase 設置腳本
# 自動化 Supabase 項目設置和數據庫初始化

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 檢查 Supabase CLI
check_supabase_cli() {
    log_info "檢查 Supabase CLI..."
    
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI 未安裝"
        log_info "請安裝 Supabase CLI:"
        echo "  npm install -g supabase"
        echo "  或訪問: https://supabase.com/docs/guides/cli"
        exit 1
    fi
    
    log_success "Supabase CLI 版本: $(supabase --version)"
}

# 初始化 Supabase 項目
init_supabase_project() {
    log_info "初始化 Supabase 項目..."
    
    if [ ! -d ".supabase" ]; then
        supabase init
        log_success "Supabase 項目初始化完成"
    else
        log_info "Supabase 項目已存在"
    fi
}

# 設置環境變數
setup_environment() {
    log_info "設置 Supabase 環境變數..."
    
    # 檢查是否已有 .env 文件
    if [ ! -f ".env.local" ]; then
        log_warning "未找到 .env.local 文件，創建模板..."
        cat > .env.local << EOF
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe 配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
EOF
        log_info "已創建 .env.local 模板，請填入實際值"
    fi
}

# 部署數據庫 schema
deploy_schema() {
    log_info "部署數據庫 schema..."
    
    if [ -f "supabase/schema.sql" ]; then
        # 檢查是否已連接遠程數據庫
        if supabase status &> /dev/null; then
            log_info "部署到遠程數據庫..."
            supabase db push
        else
            log_info "部署到本地數據庫..."
            supabase db reset
        fi
        log_success "Schema 部署完成"
    else
        log_error "未找到 schema.sql 文件"
        exit 1
    fi
}

# 插入 seed 數據
insert_seed_data() {
    log_info "插入 seed 數據..."
    
    # 創建 seed 數據文件
    cat > supabase/seed.sql << EOF
-- Tool Zoo Seed 數據

-- 插入默認功能
INSERT INTO public.features (name, description, required_tier) VALUES
('entitlements_sandbox', 'Multi-tenant permission management with Stripe integration', 'pro'),
('json_salvage_kit', 'AI output format repair tool with JSON Schema validation', 'pro'),
('pipeline_dashboard', 'AI Pipeline full-process monitoring and cost analysis', 'pro'),
('advanced_analytics', 'Advanced analytics and reporting features', 'enterprise'),
('custom_integrations', 'Custom API integrations and webhooks', 'enterprise'),
('priority_support', 'Priority customer support with SLA guarantees', 'enterprise')
ON CONFLICT (name) DO NOTHING;

-- 插入示例用戶 (僅用於測試)
INSERT INTO public.users (id, email, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'demo@toolzoo.com', NOW())
ON CONFLICT (id) DO NOTHING;

-- 插入示例訂閱
INSERT INTO public.subscriptions (user_id, stripe_subscription_id, status, current_period_start, current_period_end) VALUES
('00000000-0000-0000-0000-000000000001', 'sub_demo_001', 'active', NOW(), NOW() + INTERVAL '1 month')
ON CONFLICT (stripe_subscription_id) DO NOTHING;

-- 插入示例 pipeline 指標
INSERT INTO public.pipeline_metrics (user_id, pipeline_name, metric_name, metric_value, metric_unit, timestamp) VALUES
('00000000-0000-0000-0000-000000000001', 'gpt-4-pipeline', 'response_time', 450, 'ms', NOW()),
('00000000-0000-0000-0000-000000000001', 'gpt-4-pipeline', 'success_rate', 98.5, 'percent', NOW()),
('00000000-0000-0000-0000-000000000001', 'claude-pipeline', 'response_time', 650, 'ms', NOW()),
('00000000-0000-0000-0000-000000000001', 'claude-pipeline', 'success_rate', 99.2, 'percent', NOW());

-- 插入示例 salvage 日誌
INSERT INTO public.salvage_logs (user_id, original_json, repaired_json, repair_strategy, success, processing_time_ms, cost_usd) VALUES
('00000000-0000-0000-0000-000000000001', '{"name": "test", "value": 123}', '{"name": "test", "value": 123}', 'fix-unquoted-keys', true, 50, 0.001),
('00000000-0000-0000-0000-000000000001', '{"invalid": json}', '{"invalid": "json"}', 'fix-single-quotes,fix-unquoted-keys', true, 120, 0.002);
EOF
    
    # 執行 seed 數據
    if supabase status &> /dev/null; then
        log_info "插入 seed 數據到遠程數據庫..."
        supabase db push --include-seed
    else
        log_info "插入 seed 數據到本地數據庫..."
        supabase db reset --include-seed
    fi
    
    log_success "Seed 數據插入完成"
}

# 設置 RLS 策略
setup_rls() {
    log_info "設置 RLS 策略..."
    
    # RLS 策略已在 schema.sql 中定義
    log_success "RLS 策略已設置"
}

# 生成 API 密鑰
generate_api_keys() {
    log_info "生成 API 密鑰..."
    
    # 獲取項目 URL 和密鑰
    PROJECT_URL=$(supabase status --output json | jq -r '.api.url' 2>/dev/null || echo "")
    ANON_KEY=$(supabase status --output json | jq -r '.api.anon_key' 2>/dev/null || echo "")
    
    if [ -n "$PROJECT_URL" ] && [ -n "$ANON_KEY" ]; then
        log_success "API 密鑰已生成"
        echo
        echo "📋 Supabase 配置信息:"
        echo "  URL: $PROJECT_URL"
        echo "  Anon Key: $ANON_KEY"
        echo
        echo "請將這些值添加到 .env.local 文件中"
    else
        log_warning "無法獲取 API 密鑰，請手動設置"
    fi
}

# 健康檢查
health_check() {
    log_info "執行健康檢查..."
    
    # 檢查數據庫連接
    if supabase status &> /dev/null; then
        log_success "Supabase 連接正常"
    else
        log_warning "無法連接到 Supabase，請檢查配置"
    fi
}

# 顯示設置信息
show_setup_info() {
    log_success "Supabase 設置完成！"
    echo
    echo "🎉 Tool Zoo Supabase 環境已準備就緒"
    echo
    echo "📋 設置信息:"
    echo "  - 數據庫: PostgreSQL (Supabase)"
    echo "  - 認證: Supabase Auth"
    echo "  - 存儲: Supabase Storage"
    echo "  - 實時: Supabase Realtime"
    echo
    echo "🔗 管理地址:"
    echo "  - Supabase Dashboard: https://supabase.com/dashboard"
    echo "  - 本地開發: http://localhost:54323"
    echo
    echo "📚 文檔:"
    echo "  - Supabase 文檔: https://supabase.com/docs"
    echo "  - API 參考: https://supabase.com/docs/reference"
}

# 主函數
main() {
    echo "🗄️ Tool Zoo - Supabase 設置腳本"
    echo "================================="
    echo
    
    # 檢查參數
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        echo "用法: $0 [選項]"
        echo
        echo "選項:"
        echo "  --help, -h     顯示幫助信息"
        echo "  --local        只設置本地環境"
        echo "  --remote       只設置遠程環境"
        echo "  --seed-only    只插入 seed 數據"
        echo
        exit 0
    fi
    
    # 設置標誌
    LOCAL_ONLY=false
    REMOTE_ONLY=false
    SEED_ONLY=false
    
    for arg in "$@"; do
        case $arg in
            --local)
                LOCAL_ONLY=true
                shift
                ;;
            --remote)
                REMOTE_ONLY=true
                shift
                ;;
            --seed-only)
                SEED_ONLY=true
                shift
                ;;
        esac
    done
    
    # 執行設置流程
    check_supabase_cli
    
    if [ "$SEED_ONLY" = true ]; then
        insert_seed_data
        exit 0
    fi
    
    init_supabase_project
    setup_environment
    
    if [ "$LOCAL_ONLY" = false ]; then
        deploy_schema
        insert_seed_data
        setup_rls
        generate_api_keys
    fi
    
    health_check
    show_setup_info
}

# 執行主函數
main "$@"

