"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { getDictionary } from "@/lib/getDictionary";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const pathname = usePathname();

  // ✅ Detect language from the URL
  const lang = pathname.split("/")[1] || "en";
  const dict = getDictionary(lang);

  const navItems = [
    { href: "/tools", label: dict.nav?.tools || "Tools" },
    { href: "/about", label: dict.nav?.about || "About" },
    { href: "/contact", label: dict.nav?.contact || "Contact" },
  ];

  const isActive = (href: string) => pathname.startsWith(`/${lang}${href}`);

  return (
    <nav className="w-full bg-background border-b navbar-border">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* ✅ Logo / Brand */}
        <Link
          href={`/${lang}`}
          className="font-heading text-lg font-semibold tracking-tight"
        >
          <span className="brand-belajar">Belajar</span><span className="brand-finance">Finance</span>
        </Link>

        {/* ✅ Desktop nav links */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={`/${lang}${href}`}
              className={`text-sm font-medium transition ${
                isActive(href)
                  ? "menu-link-active underline underline-offset-4"
                  : "text-gray-700 dark:text-gray-300 menu-link-hover"
              }`}
            >
              {label}
            </Link>
          ))}
          <LanguageSwitcher />
        </div>

        {/* ✅ Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <LanguageSwitcher />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="p-2 hamburger-icon"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t bg-background navbar-border">
          <div className="px-4 py-3 space-y-1">
            {/* Navigation items */}
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={`/${lang}${href}`}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive(href)
                    ? "mobile-menu-item-active"
                    : "text-text-primary hover:bg-surface-secondary"
                }`}
                style={isActive(href) ? {} : { color: 'var(--text-primary)' }}
              >
                {label}
              </Link>
            ))}
            
            {/* Theme submenu */}
            <div>
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-surface-secondary transition"
              >
                <span>{dict.theme?.title || "Theme"}</span>
                {themeMenuOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {themeMenuOpen && (
                <div className="mt-2 ml-4">
                  <ThemeToggle dict={dict} showTitle={false} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}