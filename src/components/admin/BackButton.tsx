"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  label?: string;
  showDashboardButton?: boolean;
  className?: string;
  variant?: "button" | "link";
}

export function BackButton({ 
  href, 
  label = "Vissza", 
  showDashboardButton = false,
  className = "",
  variant = "button"
}: BackButtonProps) {
  const router = useRouter();
  
  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  const baseClasses = "inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200";

  if (variant === "link" && href) {
    return (
      <div className={`flex items-center space-x-3 mb-6 ${className}`}>
        <Link href={href} className={baseClasses}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {label}
        </Link>
        {showDashboardButton && (
          <Link 
            href="/admin"
            className={`${baseClasses} border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800`}
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 mb-6 ${className}`}>
      <button
        onClick={handleBack}
        className={baseClasses}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {label}
      </button>
      {showDashboardButton && (
        <Link 
          href="/admin"
          className={`${baseClasses} border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800`}
        >
          <Home className="w-4 h-4 mr-2" />
          Dashboard
        </Link>
      )}
    </div>
  );
}

export function DashboardButton({ className = "" }: { className?: string }) {
  const baseClasses = "inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200";
  
  return (
    <Link 
      href="/admin"
      className={`${baseClasses} ${className}`}
    >
      <Home className="w-4 h-4 mr-2" />
      Dashboard
    </Link>
  );
}