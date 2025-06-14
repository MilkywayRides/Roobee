import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, BarChart3, Activity, Settings } from "lucide-react";
import { ExtendedSession } from "@/types";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard",
};

export default async function AdminPage() {
  const session = (await getServerSession(authOptions)) as ExtendedSession | null;

  if (!session?.user) {
    redirect("/login");
  }

  const userName = session.user.name || "Admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {userName}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              +5 new this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-muted" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      User Activity {i}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Description of the activity
                    </p>
                  </div>
                  <div className="ml-auto font-medium">2h ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <Users className="h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Manage Users
                  </p>
                  <p className="text-sm text-muted-foreground">
                    View and manage user accounts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <FileText className="h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Generate Reports
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Create and export reports
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <Settings className="h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    System Settings
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Configure system preferences
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 