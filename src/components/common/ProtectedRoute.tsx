"use client";
import React from "react";
import { useUserStore } from "@/integrations/zustand";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/login",
}) => {
  const { user, isAuthenticated, loadingUser } = useUserStore();
  const router = useRouter();

  // Show loading while auth state is being determined
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h1>
          <p className="text-gray-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    console.log("🔒 User not authenticated, redirecting to:", redirectTo);
    router.push(redirectTo);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Redirecting...
          </h1>
          <p className="text-gray-600">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
//  console.log("✅ User authenticated, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
