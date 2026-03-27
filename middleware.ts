import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: '/login',
  },
});

// Protect professional dashboard routes
export const config = {
  matcher: ['/dashboard/:path*'],
};
