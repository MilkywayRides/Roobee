"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { VerifyForm } from "@/components/auth/verify-form";

function VerifyPageInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  if (!email) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Invalid verification link
            </h1>
            <p className="text-sm text-muted-foreground">
              Please use the verification link sent to your email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the verification code sent to {email}
          </p>
        </div>
        <VerifyForm email={email} />
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyPageInner />
    </Suspense>
  );
} 