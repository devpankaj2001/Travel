import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';

  // Check if request is coming from an admin subdomain (e.g., admin.domain.com, admin.localhost)
  const isAdminSubdomain = hostname.startsWith('admin.');

  if (isAdminSubdomain) {
    const { pathname } = url;

    // Clean URL redirect if /admin path is typed on the admin subdomain:
    // admin.domainname.com/admin/login -> admin.domainname.com/login
    // admin.domainname.com/admin/register -> admin.domainname.com/register
    if (pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname === '/admin/register') {
      return NextResponse.redirect(new URL('/register', request.url));
    }
    if (pathname === '/admin/dashboard') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Clean URL rewrites (browser URL stays admin.domainname.com/login or /register)
    if (pathname === '/' || pathname === '' || pathname === '/login') {
      return NextResponse.rewrite(new URL('/admin/login', request.url));
    }

    if (pathname === '/register' || pathname === '/signup' || pathname === '/admin/register') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname === '/dashboard') {
      return NextResponse.rewrite(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
