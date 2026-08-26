"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Loader2,
  Phone,
} from "lucide-react";
import { useAuthStore } from "@/app/features/auth/store/auth.store";
import { authApi } from "@/app/features/auth/api/auth.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawPhone = searchParams.get("phone") || "";
  const purpose = (searchParams.get("purpose") as "LOGIN" | "SIGNUP") || "LOGIN";
  const nextUrl = searchParams.get("next") || "/chat";

  const { verifyOtp, authenticated, error: storeError, clearError } = useAuthStore();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If no phone is present in query, redirect to login
  useEffect(() => {
    if (!rawPhone) {
      router.push("/login");
    }
  }, [rawPhone, router]);

  useEffect(() => {
    clearError();
    if (authenticated) {
      router.push(nextUrl);
    }
  }, [authenticated, nextUrl, router, clearError]);

  // Resend countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleDigitChange(index: number, value: string) {
    // Only accept digits
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const digit = cleaned[cleaned.length - 1] ?? "";
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto advance to next input box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits filled, trigger verify automatically
    const fullOtp = newOtp.join("");
    if (fullOtp.length === 6 && !newOtp.includes("")) {
      void submitVerification(fullOtp);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = ["", "", "", "", "", ""];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i] ?? "";
    }
    setOtp(newOtp);

    const targetIndex = Math.min(pastedData.length, 5);
    inputRefs.current[targetIndex]?.focus();

    if (pastedData.length === 6) {
      void submitVerification(pastedData);
    }
  }

  async function submitVerification(codeToSubmit?: string) {
    const code = codeToSubmit || otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setError(null);
    setLoading(true);

    const success = await verifyOtp({
      phone: rawPhone,
      code,
      purpose,
    });

    setLoading(false);

    if (success) {
      router.push(nextUrl);
    } else {
      setError(storeError || "Invalid verification code. Please check and try again.");
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;

    setError(null);
    setResending(true);
    try {
      const res = await authApi.resendOtp({
        phone: rawPhone,
        purpose,
      });

      setResending(false);
      if (res.success) {
        setCooldown(res.cooldownSeconds || 60);
      } else {
        setError(res.message || "Failed to resend code.");
      }
    } catch {
      setResending(false);
      setError("Failed to resend verification code.");
    }
  }

  // Format masked phone (e.g. +91 98765 *****)
  const maskedPhone =
    rawPhone.length > 6
      ? `${rawPhone.slice(0, rawPhone.length - 4)}****`
      : rawPhone;

  return (
    <Card className="border-zinc-800/90 bg-zinc-900/70 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-1.5 pb-4 text-center">
        <div className="mx-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400 mb-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Two-Factor Security</span>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-white">
          Verify Phone Number
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Enter the 6-digit verification code sent to{" "}
          <span className="font-mono text-zinc-200 font-medium">{maskedPhone}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {error && (
          <Alert variant="destructive" className="py-2.5 bg-red-950/40 border-red-900/60 text-xs">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 6 Digit Input Boxes */}
        <div className="flex justify-center items-center gap-2 sm:gap-3 py-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={loading}
              className="h-12 w-11 sm:h-14 sm:w-12 text-center text-lg font-bold font-mono rounded-lg border border-zinc-800 bg-zinc-950/90 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner disabled:opacity-50"
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>

        {/* Submit Action */}
        <Button
          type="button"
          onClick={() => void submitVerification()}
          className="w-full h-10 gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
          disabled={loading || otp.join("").length !== 6}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>

        {/* Resend Cooldown Section */}
        <div className="flex items-center justify-between text-xs pt-1">
          <Link
            href="/login"
            className="text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
          >
            <Phone className="h-3 w-3" />
            <span>Change phone</span>
          </Link>

          {cooldown > 0 ? (
            <span className="text-zinc-500 font-mono text-[11px]">
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resending}
              className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className={`h-3 w-3 ${resending ? "animate-spin" : ""}`} />
              <span>Resend Code</span>
            </button>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-center pb-6 border-t border-zinc-800/60 text-xs text-zinc-500">
        <span>Protected with automatic attempt throttling</span>
      </CardFooter>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}
