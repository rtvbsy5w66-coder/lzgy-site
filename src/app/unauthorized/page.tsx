"use client";

import Link from "next/link";
import { ShieldAlert, Home, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";

export default function UnauthorizedPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-6">
            <ShieldAlert className="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Hozzáférés megtagadva
        </h1>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Nincs jogosultságod az oldal megtekintésére.
        </p>

        {session ? (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
            Bejelentkezve mint: <strong>{session.user?.email}</strong>
            <br />
            Szerepkör: <strong>{session.user?.role || 'USER'}</strong>
            <br />
            <span className="text-xs">
              (Admin jogosultság szükséges)
            </span>
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
            Kérlek, jelentkezz be egy admin fiókkal.
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {!session && (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <LogIn className="w-5 h-5" />
              Bejelentkezés
            </Link>
          )}

          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <Home className="w-5 h-5" />
            Vissza a főoldalra
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ha úgy gondolod, hogy ez egy hiba, kérlek, vedd fel a kapcsolatot az adminisztrátorral.
          </p>
        </div>
      </div>
    </div>
  );
}
