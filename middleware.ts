import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Ana domain (Vercel domain)
  const mainDomain = 'gayrimenkul-crm.vercel.app';
  
  // Eğer ana domain ise, normal routing
  if (hostname.includes(mainDomain) || hostname.includes('localhost')) {
    return NextResponse.next();
  }

  // Custom domain (ardaemlak.com gibi)
  // Domain'den danışmanı bul ve direkt landing page'ine yönlendir
  const customDomain = hostname.replace('www.', '');
  
  // Root path'te ise danışman sayfasına rewrite et
  if (url.pathname === '/' || url.pathname === '') {
    // Custom domain -> /d/[domain] sayfasına rewrite
    url.pathname = `/d/${customDomain}`;
    return NextResponse.rewrite(url);
  }

  // Diğer path'ler için normal devam et
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
