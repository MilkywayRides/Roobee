import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Home, ArrowLeft, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist",
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-2xl">
        {/* 404 Badge */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="text-lg px-6 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
            404
          </Badge>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-3">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Page Not Found
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
                Oops! The page you're looking for seems to have wandered off into the digital wilderness.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Helpful Suggestions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Here are some things you can try:
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4">
                    <li>• Check the URL for typos</li>
                    <li>• Use the navigation menu above</li>
                    <li>• Go back to the previous page</li>
                    <li>• Return to the homepage</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <Button asChild variant="outline" size="lg" className="group">
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button asChild size="lg" className="group">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Go Home
                </Link>
              </Button>
            </div>

            {/* Additional Links */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link 
                  href="/projects" 
                  className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                >
                  Projects
                </Link>
                <Link 
                  href="/posts" 
                  className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                >
                  Posts
                </Link>
                <Link 
                  href="/contact" 
                  className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-800/20 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-800/20 rounded-full blur-3xl opacity-20"></div>
        </div>
      </div>
    </div>
  );
} 