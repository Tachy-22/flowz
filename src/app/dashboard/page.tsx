"use client";
import React from "react";
import { useUserStore } from "@/integrations/zustand";
import { authService } from "@/integrations/firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { user, isAuthenticated, resetUserState } = useUserStore();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      resetUserState();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      // Redirect to workspace instead of staying on dashboard
      router.push("/workspace");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.displayName || user.email}!
              </h1>
              <p className="text-gray-600 mt-2">
                Start creating amazing flow diagrams
              </p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Sign Out
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Diagram</CardTitle>
              <CardDescription>
                Start building a new flow diagram from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                New Diagram
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Diagrams</CardTitle>
              <CardDescription>
                Continue working on your recent projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">No recent diagrams yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                Choose from pre-built diagram templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Browse Templates
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Display Name:</strong> {user.displayName || "Not set"}
                </p>
                <p>
                  <strong>Email Verified:</strong>{" "}
                  {user.emailVerified ? "Yes" : "No"}
                </p>
                <p>
                  <strong>User ID:</strong> {user.uid}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
