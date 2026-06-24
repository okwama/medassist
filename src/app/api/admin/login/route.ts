import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    const expectedUsername = process.env.ADMIN_USERNAME || 'admin'
    const expectedPassword = process.env.ADMIN_PASSWORD || 'changeme123'

    if (username !== expectedUsername || password !== expectedPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const secret = new TextEncoder().encode(
      process.env.ADMIN_JWT_SECRET || 'supersecretkey32chars1234567890'
    )
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(secret)

    const res = NextResponse.json({ success: true })
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/'
    })

    return res

  } catch (err: any) {
    console.error('[admin login error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
