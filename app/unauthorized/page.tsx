import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Unauthorized Access",
  description: "You don't have permission to access this page",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
              You don't have permission to access this page
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Please contact your administrator if you believe this is a mistake or need access to this resource.
              </p>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <Button asChild className="w-full" size="lg">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 