import { NextResponse } from 'next/server'
import { signOut } from '@/lib/supabase-auth'
import { handleSupabaseError } from '@/lib/error-handler'

export async function POST() {
  try {
    // 登出用戶
    await signOut()
    
    return NextResponse.json({
      success: true,
      message: '登出成功！'
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
