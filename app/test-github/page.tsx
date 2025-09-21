"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestGitHub() {
  const { data: session, status } = useSession();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>GitHub Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Status:</strong> {status}
          </div>
          
          {session && (
            <div className="space-y-2">
              <div><strong>User:</strong> {session.user?.name}</div>
              <div><strong>Email:</strong> {session.user?.email}</div>
              <div><strong>Access Token:</strong> {session.accessToken ? "Present" : "Missing"}</div>
            </div>
          )}
          
          <div className="flex gap-2">
            {status === "authenticated" ? (
              <Button onClick={() => signOut()}>Sign Out</Button>
            ) : (
              <Button onClick={() => signIn("github", { callbackUrl: "/test-github" })}>Sign In with GitHub</Button>
            )}
          </div>
          
          {status === "authenticated" && (
            <Button 
              onClick={async () => {
                const res = await fetch("/api/github/repos");
                const data = await res.json();
                console.log("Repos:", data);
                alert(`Found ${Array.isArray(data) ? data.length : 0} repositories`);
              }}
            >
              Test GitHub API
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}