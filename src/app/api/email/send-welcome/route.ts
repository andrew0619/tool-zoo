import { NextRequest, NextResponse } from 'next/server'
import { emailMarketing } from '@/lib/email-marketing'

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, source = 'website' } = await request.json()

    // 驗證輸入
    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Email and firstName are required' },
        { status: 400 }
      )
    }

    // 添加訂閱者
    const subscriber = await emailMarketing.addSubscriber({
      email,
      firstName,
      lastName,
      status: 'active',
      tags: ['new-user', 'welcome-series'],
      source,
      metadata: {
        signupDate: new Date().toISOString(),
        source: source
      }
    })

    // 觸發歡迎郵件自動化
    await emailMarketing.triggerAutomation('signup', subscriber)

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      subscriberId: subscriber.id
    })

  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // 檢查訂閱者狀態
    const subscribers = await emailMarketing.getSubscribers()
    const subscriber = subscribers.find(s => s.email === email)

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        firstName: subscriber.firstName,
        status: subscriber.status,
        subscribedAt: subscriber.subscribedAt,
        tags: subscriber.tags
      }
    })

  } catch (error) {
    console.error('Error checking subscriber status:', error)
    return NextResponse.json(
      { error: 'Failed to check subscriber status' },
      { status: 500 }
    )
  }
}

