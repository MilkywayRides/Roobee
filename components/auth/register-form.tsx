"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RegisterForm({ className, ...props }: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const isFormValid = formData.name.trim() !== "" && 
                     formData.email.trim() !== "" && 
                     formData.password.trim() !== "" && 
                     termsAccepted;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (!isFormValid) {
      toast.error("Please fill in all fields and accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      toast.success("Registration successful! Please check your email to verify your account.");
      router.push("/verify");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit} className="space-y-4">
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