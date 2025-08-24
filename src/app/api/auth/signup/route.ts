import { NextRequest, NextResponse } from 'next/server'
import { signUp } from '@/lib/supabase-auth'
import { SignUpSchema } from '@/lib/types'
import { handleSupabaseError } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 驗證請求數據
    const validatedData = SignUpSchema.parse(body)
    
    // 註冊用戶
    const { user, session } = await signUp(validatedData.email, validatedData.password)
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user?.id,
          email: user?.email
        },
        session
      },
      message: '註冊成功！請檢查您的電子郵件以驗證帳號。'
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
