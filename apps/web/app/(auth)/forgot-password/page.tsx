"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { authApi } from "@/app/features/auth/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setLoading(false);
      setSubmitted(true);
    } catch {
      setLoading(false);
      setError("Unable to process request. Please try again later.");
    }
  }

  return (
    <Card className="border-zinc-800/90 bg-zinc-900/70 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-1.5 pb-4 text-center">
        <CardTitle className="text-xl font-bold tracking-tight text-white">
          Reset Your Password
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Enter your email address to receive password recovery instructions.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {submitted ? (
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-emerald-300">
                  Password Reset Instructions Sent
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  If an account exists with <span className="text-white font-medium">{email}</span>, we have prepared reset instructions. In development mode, check your backend server console for the reset link.
                </p>
              </div>
            </div>

            <Button
              asChild
              className="w-full h-10 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
            >
              <Link href="/login">Return to Sign In</Link>
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="py-2.5 bg-red-950/40 border-red-900/60 text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    type="email"
                    placeholder="developer@nodebase.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 pl-9 bg-zinc-950/80 border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:border-blue-500"
                    autoComplete="email"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-center pb-6 border-t border-zinc-800/60 text-xs text-zinc-400">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
