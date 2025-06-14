import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    console.log("[REGISTER] Starting registration process");
    const body = await req.json();
    console.log("[REGISTER] Request body:", { ...body, password: "***" });

    const { name, email, password } = registerSchema.parse(body);
    console.log("[REGISTER] Validated input data");

    // Check if user exists and is verified
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser?.emailVerified) {
      console.log("[REGISTER] User already exists and is verified");
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // If user exists but is not verified, delete the old record
    if (existingUser) {
      console.log("[REGISTER] Deleting unverified user");
      await prisma.user.delete({
        where: { email },
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

    // Send verification email with OTP
    if (!process.env.RESEND_API_KEY) {
      console.error("[REGISTER] RESEND_API_KEY is not configured");
      // Delete the user since email sending failed
      await prisma.user.delete({
        where: { email },
      });
      return NextResponse.json(
        { message: "Email service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    try {
      console.log("[REGISTER] Sending verification email");
      const { error } = await resend.emails.send({
        from: "Auth System <devambienceweb@gmail.com>",
        to: email,
        subject: "Verify your email",
        html: `
          <h1>Welcome to Auth System!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for registering with Auth System. Please use the following code to verify your email:</p>
          <h2 style="font-size: 24px; letter-spacing: 2px; text-align: center; padding: 10px; background: #f4f4f4; border-radius: 4px;">${otp}</h2>
          <p>This code will expire in 10 minutes.</p>
        `,
      });

      if (error) {
        console.error("[REGISTER] Email sending failed:", error);
        // Delete the user since email sending failed
        await prisma.user.delete({
          where: { email },
        });
        return NextResponse.json(
          { message: "Failed to send verification email. Please try again." },
          { status: 500 }
        );
      }
      console.log("[REGISTER] Verification email sent successfully");
    } catch (emailError) {
      console.error("[REGISTER] Email sending error:", emailError);
      // Delete the user since email sending failed
      await prisma.user.delete({
        where: { email },
      });
      return NextResponse.json(
        { message: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    console.log("[REGISTER] Registration completed successfully");
    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[REGISTER] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to process request" },
      { status: 500 }
    );
  }
} 