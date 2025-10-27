"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { getDictionary } from "@/lib/getDictionary";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
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
    <nav className="w-full bg-background border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* ✅ Logo / Brand */}
        <Link
          href={`/${lang}`}
          className="font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          Belajar<span className="text-blue-600">Finance</span>
        </Link>

        {/* ✅ Desktop nav links */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={`/${lang}${href}`}
              className={`text-sm font-medium transition ${
                isActive(href)
                  ? "text-blue-600 dark:text-blue-400 underline underline-offset-4"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
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
            className="p-2"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-background">
          <div className="px-4 py-3 space-y-2">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={`/${lang}${href}`}
                onClick={() => setMenuOpen(false)}
                className={`block font-medium ${
                  isActive(href)
                    ? "text-blue-600 dark:text-blue-400 underline underline-offset-4"
                    : "text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}