"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Clock, 
  User, 
  Globe,
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from "lucide-react";

interface SecurityEvent {
  id: string;
  event: string;
  userId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

interface SecurityStats {
  totalEvents: number;
  suspiciousActivities: number;
  failedLogins: number;
  rateLimitExceeded: number;
  unauthorizedAccess: number;
  recentEvents: SecurityEvent[];
}

export default function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/security/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch security data');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'SUSPICIOUS_ACTIVITY_DETECTED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'LOGIN_ATTEMPT_INVALID_PASSWORD':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'RATE_LIMIT_EXCEEDED':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'UNAUTHORIZED_ADMIN_ACCESS':
        return <Eye className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'SUSPICIOUS_ACTIVITY_DETECTED':
      case 'UNAUTHORIZED_ADMIN_ACCESS':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'LOGIN_ATTEMPT_INVALID_PASSWORD':
      case 'RATE_LIMIT_EXCEEDED':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchSecurityData}>Retry</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Security Dashboard</h1>
            <p className="text-muted-foreground">Monitor security events and system health</p>
          </div>
          <Button onClick={fetchSecurityData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspicious Activities</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.suspiciousActivities || 0}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.failedLogins || 0}</div>
              <p className="text-xs text-muted-foreground">
                Potential attacks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rate Limited</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.rateLimitExceeded || 0}</div>
              <p className="text-xs text-muted-foreground">
                Abuse prevention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>
              Latest security events and suspicious activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentEvents?.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border ${getEventColor(event.event)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getEventIcon(event.event)}
                      <div>
                        <h4 className="font-medium">{event.event.replace(/_/g, ' ')}</h4>
                        <p className="text-sm opacity-75">
                          {event.ipAddress && `IP: ${event.ipAddress}`}
                          {event.userId && ` • User: ${event.userId.substring(0, 8)}...`}
                        </p>
                        <p className="text-xs opacity-60">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.event.includes('SUSPICIOUS') ? 'High' : 
                       event.event.includes('UNAUTHORIZED') ? 'High' : 
                       event.event.includes('RATE_LIMIT') ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                  {event.details && (
                    <div className="mt-2 text-sm opacity-75">
                      <details>
                        <summary className="cursor-pointer">View Details</summary>
                        <pre className="mt-2 text-xs bg-black/10 p-2 rounded overflow-x-auto">
                          {JSON.stringify(JSON.parse(event.details), null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
              
              {(!stats?.recentEvents || stats.recentEvents.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent security events</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Security Recommendations</CardTitle>
            <CardDescription>
              Actions to improve system security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Monitor Suspicious Activities</h4>
                  <p className="text-sm text-muted-foreground">
                    Review and investigate any suspicious activities detected by the system.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Review Failed Login Attempts</h4>
                  <p className="text-sm text-muted-foreground">
                    Check for patterns in failed login attempts that might indicate brute force attacks.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Adjust Rate Limits</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider adjusting rate limits based on legitimate traffic patterns.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 