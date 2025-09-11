import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { 
  checkRateLimit, 
  addSecurityHeaders, 
  detectSuspiciousActivity,
  logSecurityEvent,
  sanitizeInput,
  isValidUUID
} from "@/lib/security";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isSuperAdminRoute = req.nextUrl.pathname.startsWith("/super-admin");
    const isProtectedApiRoute = req.nextUrl.pathname.startsWith("/api/auth") || 
                               req.nextUrl.pathname.startsWith("/api/admin") ||
                               req.nextUrl.pathname.startsWith("/api/user") ||
                               req.nextUrl.pathname.startsWith("/api/users") ||
                               req.nextUrl.pathname.startsWith("/api/files");
    
    // Get client IP and user agent
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Check for suspicious activity
    if (detectSuspiciousActivity(userAgent, clientIP)) {
      await logSecurityEvent('SUSPICIOUS_ACTIVITY_DETECTED', token?.sub, {
        userAgent,
        ip: clientIP,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      return new NextResponse("Forbidden", { status: 403 });
    }
    
    // Rate limiting for protected API routes
    if (isProtectedApiRoute) {
      const rateLimitResult = checkRateLimit(req, token?.sub);
      if (!rateLimitResult.allowed) {
        return new NextResponse("Too Many Requests", { 
          status: 429,
          headers: {
            'Retry-After': '900', // 15 minutes
            'X-RateLimit-Remaining': '0',
          }
        });
      }
    }
    
    // Enhanced rate limiting for sensitive routes
    if (req.nextUrl.pathname.startsWith("/api/auth/login")) {
      const loginRateLimit = checkRateLimit(req, clientIP);
      if (!loginRateLimit.allowed) {
        await logSecurityEvent('LOGIN_RATE_LIMIT_EXCEEDED', token?.sub, {
          ip: clientIP,
          userAgent,
        });
        return new NextResponse("Too Many Login Attempts", { 
          status: 429,
          headers: {
            'Retry-After': '900',
            'X-RateLimit-Remaining': '0',
          }
        });
      }
    }
    
    if (req.nextUrl.pathname.startsWith("/api/auth/register")) {
      const registerRateLimit = checkRateLimit(req, clientIP);
      if (!registerRateLimit.allowed) {
        await logSecurityEvent('REGISTER_RATE_LIMIT_EXCEEDED', token?.sub, {
          ip: clientIP,
          userAgent,
        });
        return new NextResponse("Too Many Registration Attempts", { 
          status: 429,
          headers: {
            'Retry-After': '900',
            'X-RateLimit-Remaining': '0',
          }
        });
      }
    }

    // Role-based access control
    if (isSuperAdminRoute && token?.role !== "SUPER_ADMIN") {
      await logSecurityEvent('UNAUTHORIZED_SUPER_ADMIN_ACCESS', token?.sub, {
        path: req.nextUrl.pathname,
        userRole: token?.role,
        ip: clientIP,
        userAgent,
      });
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (isAdminRoute && !["ADMIN", "SUPER_ADMIN"].includes(token?.role as string)) {
      await logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', token?.sub, {
        path: req.nextUrl.pathname,
        userRole: token?.role,
        ip: clientIP,
        userAgent,
      });
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    
    // Validate UUID parameters in dynamic routes
    const pathSegments = req.nextUrl.pathname.split('/');
    for (const segment of pathSegments) {
      if (segment.length === 36 && !isValidUUID(segment)) {
        await logSecurityEvent('INVALID_UUID_ATTEMPT', token?.sub, {
          path: req.nextUrl.pathname,
          invalidSegment: segment,
          ip: clientIP,
          userAgent,
        });
        return new NextResponse("Invalid Request", { status: 400 });
      }
    }
    
    // Sanitize query parameters
    const sanitizedQuery = new URLSearchParams();
    for (const [key, value] of req.nextUrl.searchParams.entries()) {
      sanitizedQuery.set(sanitizeInput(key), sanitizeInput(value));
    }
    
    // Create response with security headers
    const response = NextResponse.next();
    addSecurityHeaders(response);
    
    // Add rate limit headers for protected API routes
    if (isProtectedApiRoute) {
      const rateLimitResult = checkRateLimit(req, token?.sub);
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 15 * 60 * 1000).toISOString());
    }
    
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public access to certain routes
        const isPublicRoute = req.nextUrl.pathname.startsWith("/api/posts");
        
        if (isPublicRoute) {
          return true; // Allow access without authentication
        }
        
        // Require authentication for all other protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*", 
    "/super-admin/:path*",
    "/api/auth/:path*",
    "/api/admin/:path*",
    "/api/user/:path*",
    "/api/users/:path*",
    "/api/files/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/posts/:path*"
  ],
}; 