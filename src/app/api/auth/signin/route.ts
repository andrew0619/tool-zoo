import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/supabase-auth'
import { SignInSchema } from '@/lib/types'
import { handleSupabaseError } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 驗證請求數據
    const validatedData = SignInSchema.parse(body)
    
    // 登入用戶
    const { user, session } = await signIn(validatedData.email, validatedData.password)
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user?.id,
          email: user?.email
        },
        session
      },
      message: '登入成功！'
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
