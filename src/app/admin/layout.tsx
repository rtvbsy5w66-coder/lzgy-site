"use client";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Login oldal kivétel - mindig engedélyezett
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Ha nem login oldal és nincs session -> redirect
    if (!isLoginPage && status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router, isLoginPage]);

  // Loading state
  if (status === "loading" && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-700">Betöltés...</div>
      </div>
    );
  }

  // Ha nincs session és nem login oldal -> semmi ne jelenjen meg
  if (!session && !isLoginPage) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isLoginPage && <AdminSidebar />}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}