"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <Separator />
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and how others see you on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session?.user ? (
                <ProfileForm user={session.user} />
              ) : (
                <p>Loading user profile...</p> // Or a loading skeleton component
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 