"use client";

import React from "react";
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone, ExternalLink, Heart } from "lucide-react";
import Link from "next/link";
import { useThemeColors } from "@/context/ThemeContext";

const Footer = () => {
  const themeColors = useThemeColors();
  const isDarkMode = themeColors.mode === 'dark';

  const quickLinks = [
    { href: "/", label: "Kezdőlap" },
    { href: "/rolam", label: "Rólam" },
    { href: "/program", label: "Program" },
    { href: "/esemenyek", label: "Események" },
  ];

  const interactiveLinks = [
    { href: "/hirek", label: "Hírek" },
    { href: "/kviz", label: "Kvízek" },
    { href: "/szavazasok", label: "Szavazások" },
    { href: "/peticiok", label: "Petíciók" },
  ];

  const socialLinks = [
    { 
      href: "https://facebook.com", 
      icon: Facebook, 
      label: "Facebook",
      hoverColor: "#1877f2"
    },
    { 
      href: "https://twitter.com", 
      icon: Twitter, 
      label: "Twitter/X",
      hoverColor: "#1da1f2"
    },
    { 
      href: "https://instagram.com", 
      icon: Instagram, 
      label: "Instagram",
      hoverColor: "#e4405f"
    },
  ];

  return (
    <footer
      className="w-full mt-16 transition-colors duration-300"
      style={{
        background: isDarkMode
          ? themeColors.cardBg
          : `linear-gradient(to bottom, ${themeColors.bg}, ${themeColors.cardBg})`,
        borderTop: `2px solid ${themeColors.gradientFrom}40`
      }}
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="text-2xl font-bold bg-clip-text text-transparent transition-all duration-300 inline-block mb-4"
              style={{
                backgroundImage: themeColors.gradient,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text'
              }}
            >
              LZGY
            </Link>
            <p 
              className="text-sm leading-relaxed mb-6"
              style={{ color: isDarkMode ? themeColors.text : '#6b7280' }}
            >
              Közösségünk építésén dolgozom, hogy együtt alakíthassuk ki egy jobb jövő alapjait. 
              Csatlakozz hozzám ezen az úton!
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" style={{ color: themeColors.gradientFrom }} />
                <span 
                  className="text-sm"
                  style={{ color: isDarkMode ? themeColors.text : '#6b7280' }}
                >
                  info@lovaszoltan.hu
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4" style={{ color: themeColors.gradientFrom }} />
                <span 
                  className="text-sm"
                  style={{ color: isDarkMode ? themeColors.text : '#6b7280' }}
                >
                  +36 30 123 4567
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4" style={{ color: themeColors.gradientFrom }} />
                <span 
                  className="text-sm"
                  style={{ color: isDarkMode ? themeColors.text : '#6b7280' }}
                >
                  Budapest, Magyarország
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: isDarkMode ? themeColors.text : '#111827' }}
            >
              Gyors linkek
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:underline"
                    style={{ 
                      color: isDarkMode ? themeColors.text : '#6b7280',
                      '--hover-color': themeColors.gradientFrom
                    } as any}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = themeColors.gradientFrom;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDarkMode ? themeColors.text : '#6b7280';
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Links */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: isDarkMode ? themeColors.text : '#111827' }}
            >
              Interaktív
            </h3>
            <ul className="space-y-3">
              {interactiveLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:underline flex items-center space-x-2"
                    style={{ 
                      color: isDarkMode ? themeColors.text : '#6b7280',
                      '--hover-color': themeColors.gradientFrom
                    } as any}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = themeColors.gradientFrom;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDarkMode ? themeColors.text : '#6b7280';
                    }}
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: isDarkMode ? themeColors.text : '#111827' }}
            >
              Kövess engem
            </h3>
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full transition-all duration-300 hover:scale-110"
                    style={{
                      backgroundColor: `${themeColors.gradientFrom}10`,
                      border: `1px solid ${themeColors.gradientFrom}20`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = social.hoverColor;
                      e.currentTarget.style.borderColor = social.hoverColor;
                      const icon = e.currentTarget.querySelector('svg');
                      if (icon) icon.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${themeColors.gradientFrom}10`;
                      e.currentTarget.style.borderColor = `${themeColors.gradientFrom}20`;
                      const icon = e.currentTarget.querySelector('svg');
                      if (icon) icon.style.color = themeColors.gradientFrom;
                    }}
                    title={social.label}
                  >
                    <IconComponent 
                      className="h-5 w-5 transition-colors duration-300" 
                      style={{ color: themeColors.gradientFrom }}
                    />
                  </a>
                );
              })}
            </div>

            {/* Newsletter */}
            <div>
              <p 
                className="text-sm mb-3"
                style={{ color: isDarkMode ? themeColors.text : '#6b7280' }}
              >
                Iratkozz fel hírlevelemre!
              </p>
              <Link
                href="/kapcsolat"
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
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
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div 
        className="border-t py-6"
        style={{ borderColor: isDarkMode ? themeColors.border : '#e5e7eb' }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div 
              className="text-sm flex items-center space-x-2"
              style={{ color: isDarkMode ? themeColors.text : '#6b7280' }}
            >
              <span>© 2024 Lovas Zoltán György. Minden jog fenntartva.</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link
                href="/adatvedelmi-nyilatkozat"
                className="text-sm transition-colors duration-300"
                style={{ 
                  color: isDarkMode ? themeColors.text : '#6b7280',
                  '--hover-color': themeColors.gradientFrom
                } as any}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = themeColors.gradientFrom;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isDarkMode ? themeColors.text : '#6b7280';
                }}
              >
                Adatvédelmi nyilatkozat
              </Link>
              
              <div 
                className="text-sm flex items-center space-x-1"
                style={{ color: isDarkMode ? themeColors.text : '#6b7280' }}
              >
                <span>Készítve</span>
                <Heart 
                  className="h-4 w-4 text-red-500 animate-pulse" 
                />
                <span>-tel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;