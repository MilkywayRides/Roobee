import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.emailVerified) {
      return new NextResponse("Email already verified", { status: 400 });
    }

    // Check if OTP exists and hasn't expired
    if (!user.resetToken || !user.resetTokenExpiry) {
      return new NextResponse("Invalid verification code", { status: 400 });
    }

    // Check if OTP has expired
    if (new Date() > user.resetTokenExpiry) {
      return new NextResponse("Verification code has expired", { status: 400 });
    }

    // Check if OTP matches
    if (user.resetToken !== otp) {
      console.error("[VERIFY_ERROR] Invalid OTP", {
        provided: otp,
        stored: user.resetToken,
        email: user.email,
      });
      return new NextResponse("Invalid verification code", { status: 400 });
    }

    // Update user's email verification status and clear OTP fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return new NextResponse("Email verified successfully", { status: 200 });
  } catch (error) {
    console.error("[VERIFY_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 