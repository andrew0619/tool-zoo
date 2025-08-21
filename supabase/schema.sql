-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
CREATE TYPE feature_tier AS ENUM ('free', 'pro', 'enterprise');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Features table
CREATE TABLE public.features (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    required_tier feature_tier NOT NULL DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User features table (many-to-many relationship)
CREATE TABLE public.user_features (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    feature_id UUID REFERENCES public.features(id) ON DELETE CASCADE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_id)
);

-- Pipeline metrics table
CREATE TABLE public.pipeline_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    pipeline_name TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- JSON salvage logs table
CREATE TABLE public.salvage_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    original_json TEXT NOT NULL,
    repaired_json TEXT,
    schema_definition TEXT,
    repair_strategy TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    processing_time_ms INTEGER,
    cost_usd NUMERIC(10,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_features_user_id ON public.user_features(user_id);
CREATE INDEX idx_user_features_feature_id ON public.user_features(feature_id);
CREATE INDEX idx_pipeline_metrics_user_id ON public.pipeline_metrics(user_id);
CREATE INDEX idx_pipeline_metrics_timestamp ON public.pipeline_metrics(timestamp);
CREATE INDEX idx_salvage_logs_user_id ON public.salvage_logs(user_id);
CREATE INDEX idx_salvage_logs_created_at ON public.salvage_logs(created_at);

-- Insert default features
INSERT INTO public.features (name, description, required_tier) VALUES
('entitlements_sandbox', 'Multi-tenant permission management with Stripe integration', 'pro'),
('json_salvage_kit', 'AI output format repair tool with JSON Schema validation', 'pro'),
('pipeline_dashboard', 'AI Pipeline full-process monitoring and cost analysis', 'pro'),
('advanced_analytics', 'Advanced analytics and reporting features', 'enterprise'),
('custom_integrations', 'Custom API integrations and webhooks', 'enterprise'),
('priority_support', 'Priority customer support with SLA guarantees', 'enterprise');

-- Create RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salvage_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Features policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view features" ON public.features
    FOR SELECT USING (auth.role() = 'authenticated');

-- User features policies
CREATE POLICY "Users can view own feature access" ON public.user_features
    FOR SELECT USING (auth.uid() = user_id);

-- Pipeline metrics policies
CREATE POLICY "Users can view own metrics" ON public.pipeline_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" ON public.pipeline_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Salvage logs policies
CREATE POLICY "Users can view own salvage logs" ON public.salvage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own salvage logs" ON public.salvage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(user_uuid UUID)
RETURNS feature_tier AS $$
DECLARE
    subscription_status subscription_status;
BEGIN
    SELECT s.status INTO subscription_status
    FROM public.subscriptions s
    WHERE s.user_id = user_uuid
    AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    IF subscription_status = 'active' THEN
        RETURN 'pro';
    ELSE
        RETURN 'free';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION public.has_feature_access(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier feature_tier;
    required_tier feature_tier;
BEGIN
    -- Get user's subscription tier
    SELECT get_user_subscription_tier(user_uuid) INTO user_tier;
    
    -- Get feature's required tier
    SELECT f.required_tier INTO required_tier
    FROM public.features f
    WHERE f.name = feature_name;
    
    -- Check if user has sufficient tier
    IF user_tier = 'enterprise' THEN
        RETURN true;
    ELSIF user_tier = 'pro' AND required_tier IN ('free', 'pro') THEN
        RETURN true;
    ELSIF user_tier = 'free' AND required_tier = 'free' THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
