"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { OTPInput } from "@/components/ui/otp-input";

interface RegisterVerifyFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onVerificationStart?: (email: string) => void;
  onVerificationEnd?: () => void;
  isVerifying?: boolean;
  userEmail?: string;
}

type FieldErrors = {
  name?: string[];
  email?: string[];
  password?: string[];
  otp?: string[];
};

export function RegisterVerifyForm({ 
  className, 
  onVerificationStart,
  onVerificationEnd,
  isVerifying: externalIsVerifying,
  userEmail: externalUserEmail,
  ...props 
}: RegisterVerifyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [showOTP, setShowOTP] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>(externalUserEmail || "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: ""
  });

  // Use external state if provided, otherwise use internal state
  const isVerifying = externalIsVerifying !== undefined ? externalIsVerifying : showOTP;
  const currentUserEmail = externalUserEmail || userEmail;

  // Password validation rules
  const passwordRequirements = {
    minLength: formData.password.length >= 12,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  const isFormValid = formData.name.trim() !== "" && 
                     formData.email.trim() !== "" && 
                     formData.password.trim() !== "" && 
                     termsAccepted;

  const isOTPValid = formData.otp.length === 6;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleOTPChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      otp: value
    }));
    setErrors(prev => ({ ...prev, otp: undefined }));
  };

  async function handleRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    
    if (!isFormValid) {
      toast.error("Please fill in all fields and accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
          toast.error(data.message || "Please check the form for errors.");
        } else {
          toast.error(data.message || "Registration failed");
        }
        return;
      }

      setUserEmail(formData.email);
      setShowOTP(true);
      onVerificationStart?.(formData.email);
      toast.success("Registration successful! Please enter the verification code sent to your email.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    if (!isOTPValid) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUserEmail,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
          toast.error(data.message || "Please check the verification code.");
        } else {
          toast.error(data.message || "Verification failed");
        }
        return;
      }

      toast.success("Email verified successfully! You can now sign in.");
      onVerificationEnd?.();
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isVerifying) {
    return (
      <div className={cn("grid gap-6", className)} {...props}>
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the verification code sent to {currentUserEmail}
          </p>
        </div>
        
        <form onSubmit={handleVerification} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <OTPInput
              value={formData.otp}
              onChange={handleOTPChange}
              length={6}
              disabled={isLoading}
              className="justify-center"
            />
            {errors.otp && <p className="text-sm text-red-500">{errors.otp[0]}</p>}
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !isOTPValid}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>

        <Button
          variant="outline"
          onClick={() => {
            setShowOTP(false);
            onVerificationEnd?.();
          }}
          disabled={isLoading}
          className="w-full"
        >
          Back to Registration
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleRegistration} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            disabled={isLoading}
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isLoading}
            value={formData.email}
            onChange={handleInputChange}
            placeholder="name@example.com"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            disabled={isLoading}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a strong password"
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password[0]}</p>}
          
          {/* Password strength indicator */}
          {formData.password && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground">Password requirements:</p>
              <div className="space-y-1">
                <div className={`flex items-center text-xs ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-1">{passwordRequirements.minLength ? '✓' : '○'}</span>
                  At least 12 characters
                </div>
                <div className={`flex items-center text-xs ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-1">{passwordRequirements.hasUppercase ? '✓' : '○'}</span>
                  One uppercase letter
                </div>
                <div className={`flex items-center text-xs ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-1">{passwordRequirements.hasLowercase ? '✓' : '○'}</span>
                  One lowercase letter
                </div>
                <div className={`flex items-center text-xs ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-1">{passwordRequirements.hasNumber ? '✓' : '○'}</span>
                  One number
                </div>
                <div className={`flex items-center text-xs ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-1">{passwordRequirements.hasSpecialChar ? '✓' : '○'}</span>
                  One special character
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked: boolean) => setTermsAccepted(checked)}
            disabled={isLoading}
          />
          <Label
            htmlFor="terms"
            className="text-sm text-muted-foreground"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="hover:text-brand underline underline-offset-4"
            >
              Terms and Conditions
            </Link>
          </Label>
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}{" "}
          Google
        </Button>
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}{" "}
          GitHub
        </Button>
      </div>
    </div>
  );
} 