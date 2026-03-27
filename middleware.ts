import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin-only routes
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/patients', req.url));
    }

    // Professional routes - redirect admins to admin panel
    if (path.startsWith('/dashboard') && token?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/professionals', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Protect both professional and admin routes
// Exclude public assessment routes: /assess/* and GET /api/assessments/[token]
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/professionals/:path*',
    '/api/patients/:path*',
    '/api/assessments/generate/:path*', // Solo ruta de generación requiere auth
    '/api/admin/:path*',
  ],
};
