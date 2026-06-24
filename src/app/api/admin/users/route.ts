import { NextRequest, NextResponse } from 'next/server'
import {
  initAdminUsers,
  getAllAdminUsers,
  createAdminUser,
  updateAdminUserRole,
  deleteAdminUser,
} from '@/lib/db'

// GET – list all admin users
export async function GET() {
  try {
    await initAdminUsers()
    const users = await getAllAdminUsers()
    return NextResponse.json({ users })
  } catch (err: any) {
    console.error('[admin users GET error]:', err)
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 })
  }
}

// POST – create a new admin user
export async function POST(req: NextRequest) {
  try {
    await initAdminUsers()
    const { username, password, role } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const validRoles = ['superadmin', 'admin', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    await createAdminUser(username, password, role)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[admin users POST error]:', err)
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 })
  }
}

// PATCH – update a user's role
export async function PATCH(req: NextRequest) {
  try {
    const { id, role } = await req.json()

    if (!id || !role) {
      return NextResponse.json({ error: 'ID and role are required' }, { status: 400 })
    }

    await updateAdminUserRole(Number(id), role)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[admin users PATCH error]:', err)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE – remove a user
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await deleteAdminUser(Number(id))
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[admin users DELETE error]:', err)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
