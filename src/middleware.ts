import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPageRequest = pathname.startsWith('/admin') && pathname !== '/admin'
  const isApiRequest = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login'

  if (isPageRequest || isApiRequest) {
    const token = req.cookies.get('admin_token')?.value

    if (!token) {
      if (isApiRequest) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.ADMIN_JWT_SECRET || 'supersecretkey32chars1234567890'
      )
      await jwtVerify(token, secret)
    } catch (err) {
      if (isApiRequest) {
        return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
