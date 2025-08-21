import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

// 認證相關類型
export interface AuthUser {
  id: string
  email: string
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

// 註冊新用戶
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) throw error
  
  // 創建用戶檔案
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email!,
      })
    
    if (profileError) throw profileError
  }
  
  return data
}

// 登入
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

// 登出
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// 獲取當前用戶
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// 獲取用戶檔案
export async function getUserProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

// 更新用戶檔案
export async function updateUserProfile(userId: string, updates: Partial<AuthUser>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 檢查用戶是否有功能訪問權限
export async function checkFeatureAccess(featureName: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data, error } = await supabase
    .rpc('has_feature_access', {
      user_uuid: user.id,
      feature_name: featureName
    })
  
  if (error) throw error
  return data
}

// 獲取用戶訂閱狀態
export async function getUserSubscriptionTier(): Promise<'free' | 'pro' | 'enterprise'> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'
  
  const { data, error } = await supabase
    .rpc('get_user_subscription_tier', {
      user_uuid: user.id
    })
  
  if (error) throw error
  return data
}

// 重置密碼
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  
  if (error) throw error
}

// 更新密碼
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  if (error) throw error
}

// 監聽認證狀態變化
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
