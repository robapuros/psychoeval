import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect logged-in users away from login page
    if (path === '/auth/login' && token) {
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/professionals', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard/patients', req.url));
    }

    // Admin routes protection
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/patients', req.url));
    }

    // Professional routes protection
    if (path.startsWith('/dashboard') && token?.role !== 'PROFESSIONAL') {
      return NextResponse.redirect(new URL('/admin/professionals', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public routes
        if (path.startsWith('/assess/') || path === '/') {
          return true;
        }

        // Protected routes require token
        if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/login',
  ],
};
