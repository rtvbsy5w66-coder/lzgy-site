"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn, User, Shield } from "lucide-react";
import Link from "next/link";
import PasswordlessLoginForm from "@/components/PasswordlessLoginForm";

export default function UserLogin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"passwordless" | "google">("passwordless");

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log(`[UserLogin] Authenticated user detected, redirecting to: ${callbackUrl}`);
      router.push(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    console.log(`[UserLogin] Starting Google OAuth flow`);

    try {
      const result = await signIn('google', {
        callbackUrl,
        redirect: true
      });

      console.log(`[UserLogin] SignIn result:`, result);

      if (result?.error) {
        console.error(`[UserLogin] SignIn error:`, result.error);
        setError('Bejelentkezési hiba történt. Kérjük, próbálja újra.');
      }
    } catch (err) {
      console.error(`[UserLogin] Exception during signIn:`, err);
      setError('Hiba történt a bejelentkezés során.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Betöltés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Vissza gomb */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            className="bg-transparent border-0 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Vissza
          </Button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setLoginMethod("passwordless")}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              loginMethod === "passwordless"
                ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-lg"
                : "bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70"
            }`}
          >
            🔐 Email Kód (Ajánlott)
          </button>
          <button
            onClick={() => setLoginMethod("google")}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              loginMethod === "google"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-lg"
                : "bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70"
            }`}
          >
            🌐 Google Fiók
          </button>
        </div>

        {/* Passwordless Login */}
        {loginMethod === "passwordless" && (
          <div>
            <PasswordlessLoginForm />

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                A bejelentkezéssel elfogadja az{' '}
                <Link href="/adatvedelmi-nyilatkozat" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                  Adatvédelmi nyilatkozatot
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Google Login */}
        {loginMethod === "google" && (
          <Card className="shadow-xl border-0 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Google Bejelentkezés
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Jelentkezzen be Google fiókjával
              </p>
            </CardHeader>

            <CardContent className="pt-4">
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-12 text-base font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 dark:border-gray-300 mr-3"></div>
                    Bejelentkezés...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Bejelentkezés Google-lal
                  </div>
                )}
              </Button>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  A bejelentkezéssel elfogadja az{' '}
                  <Link href="/adatvedelmi-nyilatkozat" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    Adatvédelmi nyilatkozatot
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        <div className="mt-8 bg-white/70 dark:bg-gray-800/70 rounded-lg p-6">
          <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-3 text-center">
            <strong>Miért van szükség bejelentkezésre?</strong>
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-500 dark:text-green-400">✓</span>
              Automatikus adatkitöltés
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 dark:text-green-400">✓</span>
              Eredmények és aktivitás mentése
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 dark:text-green-400">✓</span>
              Duplikált szavazások megakadályozása
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 dark:text-green-400">✓</span>
              Személyre szabott élmény
            </li>
          </ul>
        </div>

        {/* Admin bejelentkezés link */}
        <div className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center justify-center gap-1"
          >
            <Shield className="h-4 w-4" />
            Admin bejelentkezés
          </Link>
        </div>
      </div>
    </div>
  );
}