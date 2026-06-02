import { NextResponse } from 'next/server';
import { createToken } from '../../../lib/auth';

const ADMIN_USER = process.env.DASHBOARD_USERNAME || 'admin';
const ADMIN_PASS = process.env.DASHBOARD_PASSWORD || 'pureeduadmin123';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const token = await createToken({ username });

    const response = NextResponse.json({ success: true });

    // Set cookie
    response.cookies.set('pure_edu_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
