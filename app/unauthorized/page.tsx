import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Unauthorized Access",
  description: "You don't have permission to access this page",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 