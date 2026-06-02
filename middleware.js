import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get('pure_edu_session')?.value;

  const isLogPage = pathname === '/log' || pathname.startsWith('/log/');
  const isLogGetApi = pathname === '/api/log' && request.method === 'GET';
  const isLoginPage = pathname === '/login';

  if (isLogPage || isLogGetApi) {
    if (!cookie) {
      if (isLogPage) {
        return NextResponse.redirect(new URL('/login', request.url));
      } else {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const payload = await verifyToken(cookie);
    if (!payload) {
      if (isLogPage) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('pure_edu_session');
        return response;
      } else {
        const response = new NextResponse(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
        response.cookies.delete('pure_edu_session');
        return response;
      }
    }
  }

  if (isLoginPage) {
    if (cookie) {
      const payload = await verifyToken(cookie);
      if (payload) {
        return NextResponse.redirect(new URL('/log', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/log/:path*', '/api/log', '/login'],
};
