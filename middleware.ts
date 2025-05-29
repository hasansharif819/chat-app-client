import { NextRequest, NextResponse } from 'next/server';
import Cookies from 'js-cookie';

export function middleware(request: NextRequest) {
  const token = Cookies.get('token');

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/chat') || request.nextUrl.pathname.startsWith('/message');

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  return NextResponse.next();
}

// Middleware paths
export const config = {
  matcher: ['/chat/:path*', '/message/:path*', '/login', '/register'],
};
