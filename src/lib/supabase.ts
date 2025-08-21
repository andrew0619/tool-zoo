import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 創建mock客戶端
const createMockClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signUp: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    resetPasswordForEmail: async () => ({ error: null }),
    updateUser: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
  }),
  rpc: () => ({ data: null, error: null }),
})

// 檢查環境變數是否存在並創建客戶端
const shouldUseMock = !supabaseUrl || 
                     !supabaseAnonKey || 
                     supabaseUrl === 'your_supabase_url' || 
                     supabaseAnonKey === 'your_supabase_anon_key'

export const supabase = shouldUseMock 
  ? createMockClient() as any
  : createClient(supabaseUrl, supabaseAnonKey)

// 類型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          stripe_customer_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          stripe_customer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          stripe_customer_id?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
}
