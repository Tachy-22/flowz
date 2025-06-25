"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { authService } from "@/integrations/firebase/auth";
import { useUserStore } from "@/integrations/zustand";
import { Loader2, Mail, CheckCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();
  const router = useRouter();

  const handleResendVerification = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authService.resendEmailVerification();
      setMessage("Verification email sent! Please check your inbox.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push("/dashboard");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Not signed in
          </h1>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            {user.emailVerified ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Mail className="w-6 h-6 text-indigo-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {user.emailVerified ? "Email Verified!" : "Check your email"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {user.emailVerified
              ? "Your email has been successfully verified."
              : `We sent a verification link to ${user.email}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {user.emailVerified ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Your account is now fully set up and ready to use.
              </p>
              <Button
                onClick={handleContinue}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5"
              >
                Continue to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Please check your email and click the verification link to
                activate your account.
              </p>

              <Button
                onClick={handleResendVerification}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Resend verification email
              </Button>

              <Button
                onClick={handleContinue}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5"
              >
                Skip for now
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
