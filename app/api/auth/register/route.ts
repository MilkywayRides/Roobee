import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";
import { 
  validatePassword, 
  logSecurityEvent, 
  generateSecureToken,
  hashSensitiveData,
  isValidEmail,
  sanitizeInput,
  checkRateLimit
} from "@/lib/security";

const resend = new Resend(process.env.RESEND_API_KEY);

const registerSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .transform(val => sanitizeInput(val)),
  email: z.string()
    .email("Invalid email address")
    .max(254, "Email must be less than 254 characters")
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password must be less than 128 characters")
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    console.log("[REGISTER] Starting registration process");
    
    // Get client IP and user agent for security logging
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Check rate limiting
    const rateLimitResult = checkRateLimit(req as any, clientIP);
    if (!rateLimitResult.allowed) {
      await logSecurityEvent('REGISTER_RATE_LIMIT_EXCEEDED', undefined, {
        ip: clientIP,
        userAgent,
      });
      return NextResponse.json(
        { message: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }
    
    const body = await req.json();
    console.log("[REGISTER] Request body:", { ...body, password: "***" });

    const { name, email, password } = registerSchema.parse(body);
    console.log("[REGISTER] Validated input data");

    // Additional email validation
    if (!isValidEmail(email)) {
      await logSecurityEvent('REGISTER_INVALID_EMAIL', undefined, {
        email: await hashSensitiveData(email),
        ip: clientIP,
        userAgent,
      });
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Enhanced password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      await logSecurityEvent('REGISTER_WEAK_PASSWORD', undefined, {
        email: await hashSensitiveData(email),
        errors: passwordValidation.errors,
        ip: clientIP,
        userAgent,
      });
      return NextResponse.json(
        { message: "Password does not meet security requirements", errors: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Check if user exists and is verified
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser?.emailVerified) {
      console.log("[REGISTER] User already exists and is verified");
      await logSecurityEvent('REGISTER_EXISTING_USER', existingUser.id, {
        email: await hashSensitiveData(email),
        ip: clientIP,
        userAgent,
      });
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // If user exists but is not verified, delete the old record and related data
    if (existingUser) {
      console.log("[REGISTER] Deleting unverified user and related data");
      // Delete related records first to avoid foreign key constraints
      await prisma.$transaction([
        prisma.project.deleteMany({ where: { ownerId: existingUser.id } }),
        prisma.post.deleteMany({ where: { authorId: existingUser.id } }),
        prisma.user.delete({ where: { id: existingUser.id } }),
      ]);
      await logSecurityEvent('REGISTER_DELETED_UNVERIFIED_USER', existingUser.id, {
        email: await hashSensitiveData(email),
        ip: clientIP,
        userAgent,
      });
    }

    const hashedPassword = await hash(password, 12);
    const otp = generateOTP();
    console.log("[REGISTER] Generated OTP");

    // Create user first
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        resetToken: otp,
        resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
      },
    });
    console.log("[REGISTER] Created user:", { id: user.id, email: user.email });

    // Log successful user creation
    await logSecurityEvent('REGISTER_USER_CREATED', user.id, {
      email: await hashSensitiveData(email),
      ip: clientIP,
      userAgent,
    });

    // Send verification email with OTP
    if (!process.env.RESEND_API_KEY) {
      console.error("[REGISTER] RESEND_API_KEY is not configured");
      // Delete the user since email sending failed
      await prisma.user.delete({
        where: { email },
      });
      await logSecurityEvent('REGISTER_EMAIL_SERVICE_ERROR', user.id, {
        email: await hashSensitiveData(email),
        ip: clientIP,
        userAgent,
      });
      return NextResponse.json(
        { message: "Email service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    try {
      await resend.emails.send({
        from: "noreply@yourdomain.com",
        to: email,
        subject: "Verify your email address",
        html: `
          <h1>Welcome to Our Platform!</h1>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        `,
      });

      console.log("[REGISTER] Verification email sent successfully");
      await logSecurityEvent('REGISTER_VERIFICATION_EMAIL_SENT', user.id, {
        email: await hashSensitiveData(email),
        ip: clientIP,
        userAgent,
      });

      return NextResponse.json(
        { message: "Registration successful. Please check your email to verify your account." },
        { status: 201 }
      );
    } catch (emailError) {
      console.error("[REGISTER] Failed to send verification email:", emailError);
      
      // Delete the user since email sending failed
      await prisma.user.delete({
        where: { email },
      });
      
      await logSecurityEvent('REGISTER_EMAIL_SEND_FAILED', user.id, {
        email: await hashSensitiveData(email),
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
        ip: clientIP,
        userAgent,
      });

      return NextResponse.json(
        { message: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[REGISTER] Error:", error);
    
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Handle Prisma connection errors specifically
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P1001') {
        await logSecurityEvent('REGISTER_DATABASE_CONNECTION_ERROR', undefined, {
          error: 'Database connection failed',
          ip: clientIP,
          userAgent,
        });
        return NextResponse.json(
          { message: "Database connection error. Please try again in a moment." },
          { status: 503 }
        );
      }
    }
    
    if (error instanceof z.ZodError) {
      await logSecurityEvent('REGISTER_VALIDATION_ERROR', undefined, {
        errors: error.errors,
        ip: clientIP,
        userAgent,
      });
      return NextResponse.json(
        { message: "Invalid input data", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await logSecurityEvent('REGISTER_UNEXPECTED_ERROR', undefined, {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: clientIP,
      userAgent,
    });

    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
} 