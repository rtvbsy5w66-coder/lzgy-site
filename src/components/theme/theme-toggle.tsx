"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext"; // Ezt módosítottuk

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
