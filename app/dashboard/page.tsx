import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Session } from "next-auth";
import { ROLES } from "@/constants";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "User dashboard",
};

export default async function DashboardPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Get user role from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, name: true, createdAt: true }
  })

  // Redirect admins to the admin dashboard
  if (user && (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN)) {
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || session.user.name || "User"}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {user?.name || session.user.name || "Not set"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {session.user.email || "Not set"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Role:</span> {user?.role || "User"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Account Created:</span>{" "}
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}