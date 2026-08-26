"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/app/features/auth/store/auth.store";
import { authApi } from "@/app/features/auth/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/chat";

  const { login, authenticated, loading: storeLoading, error: storeError, clearError } =
    useAuthStore();

  // Tab state: "phone" | "email"
  const [activeTab, setActiveTab] = useState<string>("phone");

  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Phone form state
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
    if (authenticated) {
      router.push(nextUrl);
    }
  }, [authenticated, nextUrl, router, clearError]);

  // Handle Email + Password Login
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }
    if (!password) {
      setEmailError("Please enter your password.");
      return;
    }

    setEmailLoading(true);
    const success = await login({ email: email.trim(), password });
    setEmailLoading(false);

    if (success) {
      router.push(nextUrl);
    } else {
      setEmailError(storeError || "Invalid email or password.");
    }
  }

  // Handle Phone OTP Request
  async function handlePhoneRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setPhoneError(null);

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 7) {
      setPhoneError("Please enter a valid phone number.");
      return;
    }

    const fullPhone = `${countryCode}${cleanPhone}`;

    setPhoneLoading(true);
    try {
      const res = await authApi.requestOtp({
        phone: fullPhone,
        purpose: "LOGIN",
      });

      setPhoneLoading(false);
      if (res.success) {
        // Redirect to OTP verification screen with phone and next query parameters
        router.push(
          `/verify-otp?phone=${encodeURIComponent(fullPhone)}&purpose=LOGIN&next=${encodeURIComponent(nextUrl)}`
        );
      } else {
        setPhoneError(res.message || "Failed to send OTP. Please try again.");
      }
    } catch (err: unknown) {
      setPhoneLoading(false);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to request OTP. Please try again.";
      setPhoneError(msg);
    }
  }

  return (
    <Card className="border-zinc-800/90 bg-zinc-900/70 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-1.5 pb-4 text-center">
        <div className="mx-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-medium text-blue-400 mb-1">
          <Sparkles className="h-3 w-3" />
          <span>Universal Authentication</span>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-white">
          Sign In to NodeBase
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Access your private AI agent sessions, terminal telemetry, and memories.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs
          defaultValue="phone"
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            setEmailError(null);
            setPhoneError(null);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-zinc-950/80 p-1 border border-zinc-800">
            <TabsTrigger
              value="phone"
              className="gap-2 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-medium"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Phone OTP</span>
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="gap-2 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-medium"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email & Password</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PHONE OTP */}
          <TabsContent value="phone" className="space-y-4 pt-4">
            {phoneError && (
              <Alert variant="destructive" className="py-2.5 bg-red-950/40 border-red-900/60 text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{phoneError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePhoneRequestOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Mobile Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    aria-label="Country Code"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+65">🇸🇬 +65</option>
                  </select>

                  <div className="relative flex-1">
                    <Input
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 bg-zinc-950/80 border-zinc-800 font-mono text-sm tracking-wide text-white placeholder:text-zinc-600 focus:border-blue-500"
                      autoComplete="tel"
                      disabled={phoneLoading}
                      autoFocus
                    />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500">
                  We will send a 6-digit verification code to this phone number.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
                disabled={phoneLoading}
              >
                {phoneLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* TAB 2: EMAIL + PASSWORD */}
          <TabsContent value="email" className="space-y-4 pt-4">
            {emailError && (
              <Alert variant="destructive" className="py-2.5 bg-red-950/40 border-red-900/60 text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{emailError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Email Address
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
                    disabled={emailLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 pl-9 pr-9 bg-zinc-950/80 border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:border-blue-500 font-mono"
                    autoComplete="current-password"
                    disabled={emailLoading}
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

              <Button
                type="submit"
                className="w-full h-10 gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all mt-2"
                disabled={emailLoading}
              >
                {emailLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-3 pt-2 pb-6 border-t border-zinc-800/60 text-xs text-zinc-400">
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(nextUrl)}`}
            className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
