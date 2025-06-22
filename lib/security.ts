import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security configuration
export const SECURITY_CONFIG = {
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // requests per window
    LOGIN_MAX_REQUESTS: 5, // login attempts per window
    REGISTER_MAX_REQUESTS: 3, // registration attempts per window
  },
  PASSWORD: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  FILE_UPLOAD: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: [
      'text/plain',
      'text/markdown',
      'text/javascript',
      'application/json',
      'application/xml',
      'text/css',
      'text/html',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
    ],
  },
};

// Rate limiting function
export function rateLimit(identifier: string, maxRequests: number = SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
  const now = Date.now();
  const windowStart = now - SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS;
  
  const record = rateLimitStore.get(identifier);
  
  if (!record || record.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
    });
    return { success: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }
  
  record.count++;
  return { success: true, remaining: maxRequests - record.count };
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Validate password strength
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < SECURITY_CONFIG.PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD.MIN_LENGTH} characters long`);
  }
  
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_SPECIAL_CHARS && !/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Hash sensitive data for logging
export function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
}

// Audit logging
export async function logSecurityEvent(
  event: string,
  userId?: string,
  details?: Record<string, any>,
  ip?: string,
  userAgent?: string
) {
  try {
    await prisma.securityAuditLog.create({
      data: {
        event,
        userId: userId || null,
        details: details ? JSON.stringify(details) : null,
        ipAddress: ip || null,
        userAgent: userAgent || null,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Check if user is rate limited
export function checkRateLimit(req: NextRequest, userId?: string): { allowed: boolean; remaining: number } {
  const identifier = userId || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const result = rateLimit(identifier);
  
  if (!result.success) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', userId, {
      identifier,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      userAgent: req.headers.get('user-agent'),
    });
  }
  
  return {
    allowed: result.success,
    remaining: result.remaining,
  };
}

// Validate file upload
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  if (file.size > SECURITY_CONFIG.FILE_UPLOAD.MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${SECURITY_CONFIG.FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`,
    };
  }
  
  if (!SECURITY_CONFIG.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }
  
  return { valid: true };
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  return response;
}

// Validate UUID format
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Sanitize SQL injection attempts
export function sanitizeSQLInput(input: string): string {
  return input
    .replace(/['";\\]/g, '') // Remove SQL injection characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*.*?\*\//g, '') // Remove SQL block comments
    .substring(0, 1000); // Limit length
}

// Check for suspicious patterns
export function detectSuspiciousActivity(userAgent: string, ip: string): boolean {
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /burp/i,
    /w3af/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i,
    /metasploit/i,
    /hydra/i,
    /john/i,
    /hashcat/i,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Validate CSRF token
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(storedToken, 'hex')
  );
}
