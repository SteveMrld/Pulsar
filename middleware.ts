import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  const protectedRoutes = ['/welcome', '/dashboard', '/project', '/urgence', '/bilan', '/diagnostic', '/interpellation', '/case-matching', '/recommandations', '/pharmacovigilance', '/cockpit', '/engines', '/timeline', '/suivi', '/synthese', '/famille', '/staff', '/export', '/evidence', '/experts', '/demo', '/about', '/admission', '/audit', '/onboarding', '/observatory', '/cross-pathologie']
  const authRoutes = ['/login', '/signup']
  const path = request.nextUrl.pathname

  // Redirect unauthenticated users away from protected routes
  if (!user && !isDemo && protectedRoutes.some(r => path.startsWith(r))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if ((user || isDemo) && authRoutes.some(r => path.startsWith(r))) {
    const url = request.nextUrl.clone()
    url.pathname = '/welcome'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
