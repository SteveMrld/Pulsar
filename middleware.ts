import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware entirely for public case study pages
  if (path === '/lab' || path.startsWith('/invite') || path.startsWith('/about') || path.startsWith('/methodology')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode bypass via cookie
  const isDemo = request.cookies.get('pulsar-demo')?.value === 'true'

  const isPublic = ['/', '/login', '/signup'].includes(path)
  const isAuthPage = ['/login', '/signup'].includes(path)
  const isProtected = !isPublic && path !== '/lab' && !path.startsWith('/invite') && !path.startsWith('/about') && !path.startsWith('/methodology')

  // Redirect unauthenticated users away from protected routes
  if (!user && !isDemo && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages Ã¢ÂÂ dashboard
  if ((user || isDemo) && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
