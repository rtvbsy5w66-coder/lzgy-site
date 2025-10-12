"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, KeyRound } from "lucide-react";

type LoginStep = "password" | "2fa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<LoginStep>("password");

  // Step 1: Email + Password → Request 2FA code
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/request-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Hiba történt a bejelentkezés során");
        setLoading(false);
        return;
      }

      // Password validated, move to 2FA step
      setStep("2fa");
      setError("");
      setLoading(false);
    } catch (err) {
      setError("Hiba történt a bejelentkezés során");
      setLoading(false);
    }
  };

  // Step 2: Verify 2FA code → Complete login
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Verify 2FA code
      const verifyResponse = await fetch("/api/admin/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError(verifyData.error || "Érvénytelen kód");
        setLoading(false);
        return;
      }

      // Code verified, now complete NextAuth sign-in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Hibás email vagy jelszó!");
        setLoading(false);
      } else {
        // Sikeres login - redirect
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("Hiba történt a bejelentkezés során");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Admin Bejelentkezés
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {step === "password"
              ? "Jelentkezz be az adminisztrációs felületre"
              : "Add meg a biztonsági kódot"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-2">
          <div className={`flex items-center ${step === "password" ? "text-indigo-600 dark:text-indigo-400" : "text-green-600 dark:text-green-400"}`}>
            <Lock className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">1. Jelszó</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
          <div className={`flex items-center ${step === "2fa" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}>
            <KeyRound className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">2. 2FA Kód</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {step === "password" ? (
            /* Step 1: Email + Password Form */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email cím
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Jelszó
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Ellenőrzés..." : "Tovább →"}
              </button>
            </form>
          ) : (
            /* Step 2: 2FA Code Form */
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium">✉️ 2FA kód elküldve!</p>
                <p className="mt-1">Ellenőrizd a <strong>lovas.zoltan1986@gmail.com</strong> email fiókot.</p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">A kód 5 percig érvényes.</p>
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  6 jegyű biztonsági kód
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    id="code"
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    autoComplete="one-time-code"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep("password");
                    setCode("");
                    setError("");
                  }}
                  className="w-1/3 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-all"
                >
                  ← Vissza
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-2/3 px-4 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Ellenőrzés..." : "Bejelentkezés"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>🔒 Biztonságos kapcsolat</p>
          <p className="mt-1">
            Teszt admin: <strong>plscallmegiorgio@gmail.com</strong>
          </p>
          <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
            Jelszó: R0)fg2:EU0&lt;4k8Ubh&amp;:) | 2FA: lovas.zoltan1986@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
