"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/app/features/auth/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/chat";

  const { register, authenticated, error: storeError, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
    if (authenticated) {
      router.push(nextUrl);
    }
  }, [authenticated, nextUrl, router, clearError]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please check and retype.");
      return;
    }

    setLoading(true);
    const success = await register({
      email: email.trim(),
      password,
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    setLoading(false);

    if (success) {
      router.push(nextUrl);
    } else {
      setError(storeError || "Failed to create account. Please try again.");
    }
  }

  return (
    <Card className="border-zinc-800/90 bg-zinc-900/70 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-1.5 pb-4 text-center">
        <CardTitle className="text-xl font-bold tracking-tight text-white">
          Create NodeBase Account
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Get started with your autonomous terminal coding environment.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="py-2.5 bg-red-950/40 border-red-900/60 text-xs">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSignup} className="space-y-3.5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Full Name (Optional)
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Ankit Pandit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 pl-9 bg-zinc-950/80 border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:border-blue-500"
                autoComplete="name"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Email Address *
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
              />
            </div>
          </div>

          {/* Phone (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <Input
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 pl-9 bg-zinc-950/80 border-zinc-800 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-blue-500"
                autoComplete="tel"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 pl-9 pr-9 bg-zinc-950/80 border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:border-blue-500 font-mono"
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 pl-9 bg-zinc-950/80 border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:border-blue-500 font-mono"
                autoComplete="new-password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all mt-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-3 pt-2 pb-6 border-t border-zinc-800/60 text-xs text-zinc-400">
        <p>
          Already have an account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(nextUrl)}`}
            className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
