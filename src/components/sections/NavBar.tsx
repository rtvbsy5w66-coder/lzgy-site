"use client";
import React, { useState } from "react";
import { Menu, X, User, LogOut, Settings, LogIn } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useThemeColors } from "@/context/ThemeContext";
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const themeColors = useThemeColors();
  const isDarkMode = themeColors.mode === 'dark';
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/', redirect: true });
  };
  
  return (
    <nav className="backdrop-blur-md bg-white/70 dark:bg-black/70 fixed w-full z-[9999] shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between h-20">
          <div className="flex items-center text-left w-auto">
            <Link
              href="/"
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-clip-text text-transparent transition-all duration-300"
              style={{
                backgroundImage: themeColors.gradient,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text'
              }}
              title="Lovas Zoltán György"
            >
              LZGY
            </Link>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4 xl:space-x-6 flex-shrink-0">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-200 transition-colors duration-300 text-sm lg:text-base xl:text-lg"
              style={{
                '--hover-color': themeColors.gradientFrom
              } as any}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = themeColors.gradientFrom;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
              }}
            >
              Kezdőlap
            </Link>
            <Link
              href="/rolam"
              className="text-gray-700 dark:text-gray-200 transition-colors duration-300 text-sm lg:text-base xl:text-lg"
              style={{
                '--hover-color': themeColors.gradientFrom
              } as any}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = themeColors.gradientFrom;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
              }}
            >
              Rólam
            </Link>
            <Link
              href="/program"
              className="text-gray-700 dark:text-gray-200 transition-colors duration-300 text-sm lg:text-base xl:text-lg"
              style={{
                '--hover-color': themeColors.gradientFrom
              } as any}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = themeColors.gradientFrom;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
              }}
            >
              Program
            </Link>
            <Link
              href="/esemenyek"
              className="text-gray-700 dark:text-gray-200 transition-colors duration-300 text-sm lg:text-base xl:text-lg"
              style={{
                '--hover-color': themeColors.gradientFrom
              } as any}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = themeColors.gradientFrom;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
              }}
            >
              Események
            </Link>
            <Link
              href="/hirek"
              className="text-gray-700 dark:text-gray-200 transition-colors duration-300 text-sm lg:text-base xl:text-lg"
              style={{
                '--hover-color': themeColors.gradientFrom
              } as any}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = themeColors.gradientFrom;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
              }}
            >
              Hírek
            </Link>
            <Link
              href="/kviz"
              className="text-gray-700 dark:text-gray-200 transition-colors duration-300 text-sm lg:text-base xl:text-lg"
              style={{
                '--hover-color': themeColors.gradientFrom
              } as any}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = themeColors.gradientFrom;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
              }}
            >
              Kvízek
            </Link>
            <Link
              href="/szavazasok"
              className="text-gray-700 dark:text-gray-200 transition-colors duration-300 text-sm lg:text-base xl:text-lg"
              style={{
                '--hover-color': themeColors.gradientFrom
              } as any}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = themeColors.gradientFrom;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
              }}
            >
              Szavazások
            </Link>
            <Link
              href="/peticiok"
              className="text-gray-700 dark:text-gray-200 transition-colors duration-300 text-sm lg:text-base xl:text-lg"
              style={{
                '--hover-color': themeColors.gradientFrom
              } as any}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = themeColors.gradientFrom;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
              }}
            >
              Petíciók
            </Link>
            <ThemeToggle />
            
            {/* Authentication Section */}
            {status === 'loading' ? (
              <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 transition-colors duration-300"
                    style={{
                      '--hover-color': themeColors.gradientFrom
                    } as any}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = themeColors.gradientFrom;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '';
                    }}
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">
                      {session.user?.name?.split(' ')[0] || 'Felhasználó'}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white dark:bg-gray-800 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-2xl"
                  sideOffset={8}
                  style={{ zIndex: 10000 }}
                >
                  <DropdownMenuItem disabled className="text-gray-700 dark:text-gray-100 font-medium opacity-100 cursor-default">
                    <User className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate text-sm">{session.user?.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  {session.user?.role === 'ADMIN' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/profil" className="text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      <User className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Kijelentkezés</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-3 lg:px-4 xl:px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 text-sm lg:text-base xl:text-lg hover:scale-105 whitespace-nowrap"
                style={{
                  background: themeColors.gradient,
                  color: themeColors.accent,
                  boxShadow: `0 4px 14px ${themeColors.gradientFrom}20`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 25px ${themeColors.gradientFrom}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 4px 14px ${themeColors.gradientFrom}20`;
                }}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Bejelentkezés
              </Link>
            )}
            
            <Link
              href="/kapcsolat"
              className="px-3 lg:px-4 xl:px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 text-sm lg:text-base xl:text-lg hover:scale-105 whitespace-nowrap"
              style={{
                background: themeColors.gradient,
                color: themeColors.accent,
                boxShadow: `0 4px 14px ${themeColors.gradientFrom}20`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 25px ${themeColors.gradientFrom}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 4px 14px ${themeColors.gradientFrom}20`;
              }}
            >
              Kapcsolat
            </Link>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            
            {/* Mobile Auth Button */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="text-gray-700 dark:text-gray-200 transition-colors duration-300"
                    style={{
                      '--hover-color': themeColors.gradientFrom
                    } as any}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = themeColors.gradientFrom;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '';
                    }}
                  >
                    <User className="h-6 w-6" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl"
                  sideOffset={8}
                  style={{ zIndex: 10000 }}
                >
                  <DropdownMenuItem disabled className="text-gray-700 dark:text-gray-100 font-medium opacity-100 cursor-default">
                    <User className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate text-sm">{session.user?.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {session.user?.role === 'ADMIN' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profil" className="text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      <User className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Kijelentkezés</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                href="/login"
                className="transition-colors duration-300"
                style={{
                  '--hover-color': themeColors.gradientFrom
                } as any}
                onMouseEnter={(e) => {
                  const icon = e.currentTarget.querySelector('svg');
                  if (icon) icon.style.color = themeColors.gradientFrom;
                }}
                onMouseLeave={(e) => {
                  const icon = e.currentTarget.querySelector('svg');
                  if (icon) icon.style.color = '';
                }}
              >
                <LogIn className="h-6 w-6 text-gray-700 dark:text-gray-200" />
              </Link>
            )}
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="ml-4 text-gray-700 dark:text-gray-200 p-2 touch-manipulation active:scale-95 transition-transform"
              aria-label={isMobileMenuOpen ? "Menü bezárása" : "Menü megnyitása"}
              aria-expanded={isMobileMenuOpen}
              type="button"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute w-full bg-white dark:bg-gray-900 shadow-2xl border-t border-gray-200 dark:border-gray-700 z-[9998]">
          <div className="px-4 pt-2 pb-3 space-y-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-800 rounded-lg"
            >
              Kezdőlap
            </Link>
            <Link
              href="/rolam"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-800 rounded-lg"
            >
              Rólam
            </Link>
            <Link
              href="/program"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-800 rounded-lg"
            >
              Program
            </Link>
            <Link
              href="/esemenyek"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-800 rounded-lg"
            >
              Események
            </Link>
            <Link
              href="/hirek"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-800 rounded-lg"
            >
              Hírek
            </Link>
            <Link
              href="/kviz"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-800 rounded-lg"
            >
              Kvízek
            </Link>
            <Link
              href="/szavazasok"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-800 rounded-lg"
            >
              Szavazások
            </Link>
            <Link
              href="/peticiok"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-800 rounded-lg"
            >
              Petíciók
            </Link>
            <Link
              href="/kapcsolat"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 font-semibold active:bg-gray-100 dark:active:bg-gray-800 rounded-lg"
              style={{ color: themeColors.gradientFrom }}
            >
              Kapcsolat
            </Link>
            {!session && (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-center border-2 rounded-full mt-2 active:opacity-80"
                style={{
                  borderColor: themeColors.gradientFrom,
                  color: themeColors.gradientFrom
                }}
              >
                Bejelentkezés
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
