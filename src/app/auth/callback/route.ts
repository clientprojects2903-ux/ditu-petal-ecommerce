import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('🔐 Auth callback triggered:', {
    hasCode: !!code,
    error,
    errorDescription,
    origin: requestUrl.origin,
    fullUrl: requestUrl.toString()
  })

  // Handle OAuth provider errors
  if (error) {
    console.error('❌ OAuth provider error:', { error, errorDescription })
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || error || 'oauth_failed')}`
    )
  }

  // If no code, redirect to login
  if (!code) {
    console.error('❌ No authorization code received')
    return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`)
  }

  try {
    // Add await here - createClient() returns a Promise
    const supabase = await createClient()

    console.log('🔄 Exchanging code for session...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('❌ Code exchange failed:', {
        message: exchangeError.message,
        status: exchangeError.status
      })
      
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      )
    }

    console.log('✅ Code exchange successful!', {
      userId: data.session?.user?.id,
      userEmail: data.session?.user?.email
    })

    // Verify we have a user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Failed to get user after auth:', userError)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=user_fetch_failed`)
    }

    if (!user) {
      console.error('❌ No user found after auth')
      return NextResponse.redirect(`${requestUrl.origin}/login?error=no_user`)
    }

    console.log('🎉 User authenticated successfully:', {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.user_metadata?.full_name
    })

    // Create redirect response
    const redirectUrl = `${requestUrl.origin}/role`
    console.log(`🔄 Redirecting to: ${redirectUrl}`)
    
    const response = NextResponse.redirect(redirectUrl)
    
    return response

  } catch (err: any) {
    console.error('💥 Unexpected error in callback:', err)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(err.message || 'unexpected_error')}`
    )
  }
}