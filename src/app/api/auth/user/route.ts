import { NextResponse } from 'next/server'
import { getCurrentUser, getUserProfile } from '@/lib/supabase-auth'
import { handleSupabaseError } from '@/lib/error-handler'

export async function GET() {
  try {
    // 獲取當前用戶
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: '未登入',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      )
    }
    
    // 獲取用戶檔案
    const profile = await getUserProfile(user.id)
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at
        },
        profile
      }
    })
    
  } catch (error: unknown) {
    const appError = handleSupabaseError(error as Error)
    
    return NextResponse.json(
      {
        success: false,
        error: appError.message,
        code: appError.code
      },
      { status: 400 }
    )
  }
}
