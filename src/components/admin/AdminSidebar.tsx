"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  MessageSquare,
  Image,
  Mail,
  Vote,
  ClipboardList,
  FileSignature,
  HelpCircle,
  BarChart3,
  Settings,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

const navigation: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Program", href: "/admin/program", icon: ClipboardList },
  { title: "Események", href: "/admin/events", icon: Calendar },
  { title: "Hírek", href: "/admin/posts", icon: FileText },
  { title: "Hírlevél", href: "/admin/newsletter", icon: Mail },
  { title: "Kvízek", href: "/admin/quizzes", icon: HelpCircle },
  { title: "Szavazások", href: "/admin/polls", icon: Vote },
  { title: "Petíciók", href: "/admin/petitions", icon: FileSignature },
  { title: "Üzenetek", href: "/admin/messages", icon: MessageSquare },
  { title: "Bejelentések", href: "/admin/reports", icon: Mail },
  { title: "Slide-ok", href: "/admin/slides", icon: Image },
  { title: "Analitika", href: "/admin/analytics", icon: BarChart3 },
  { title: "Felhasználók", href: "/admin/users", icon: Users },
  { title: "Beállítások", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200
          transition-transform duration-300 z-40 w-64
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">Lovász Zoltán</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${
                          isActive
                            ? "bg-indigo-50 text-indigo-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Admin Panel v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
