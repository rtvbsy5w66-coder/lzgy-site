"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function PasswordlessLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Step 1: Request code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kód küldése sikertelen");
      }

      setSuccess(data.message);
      setStep("code");
      setCountdown(300); // 5 minutes

      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Development: Show preview URL
      if (data.previewUrl) {
        console.log("📧 Email Preview:", data.previewUrl);
      }
    } catch (err: any) {
      setError(err.message || "Hiba történt");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and sign in
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await signIn("passwordless", {
        email,
        code,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Érvénytelen kód vagy lejárt");
      }

      if (result?.ok) {
        setSuccess("✅ Sikeres bejelentkezés!");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Bejelentkezés sikertelen");
    } finally {
      setLoading(false);
    }
  };

  // Format countdown timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Go back to email step
  const handleBack = () => {
    setStep("email");
    setCode("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {step === "email" ? "Bejelentkezés" : "Kód Ellenőrzés"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {step === "email"
              ? "Adja meg email címét a belépéshez"
              : "Írja be az emailben kapott 6 jegyű kódot"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === "email" && (
          <form onSubmit={handleRequestCode} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email cím
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="nev@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Kód küldése...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Belépési kód küldése
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Code Input */}
        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                6 jegyű kód
              </label>
              <input
                id="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="block w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="000000"
                disabled={loading}
                maxLength={6}
                autoComplete="off"
              />
              {countdown > 0 && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  A kód {formatTime(countdown)} múlva jár le
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ellenőrzés...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Bejelentkezés
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Vissza
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleRequestCode}
                disabled={countdown > 240} // Can request new code after 1 minute
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50 disabled:no-underline"
              >
                Új kód küldése
              </button>
            </div>
          </form>
        )}

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            🔒 A bejelentkezési kódot soha ne ossza meg senkivel.
            Ez a kód 5 percig érvényes.
          </p>
        </div>
      </div>
    </div>
  );
}
