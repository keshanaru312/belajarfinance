"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { getDictionary } from "@/lib/getDictionary";

export default function Footer() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "en";
  const dict = getDictionary(lang);

  const navItems = [
    { href: "/tools", label: dict.nav?.tools || "Tools" },
    { href: "/about", label: dict.nav?.about || "About" },
    { href: "/contact", label: dict.nav?.contact || "Contact" },
  ];

  const isActive = (href: string) => pathname.startsWith(`/${lang}${href}`);

  return (
    <footer className="w-full mt-12 border-t bg-background navbar-border">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 text-center md:text-left">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            <span className="brand-belajar">Belajar</span><span className="brand-finance">Finance</span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dict.footer.tagline}
          </p>
        </div>

        <div className="flex justify-center md:justify-end items-center space-x-6">
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
      </div>
      <div className="border-t py-4 text-center text-xs text-gray-500 dark:text-gray-400 navbar-border">
        © {new Date().getFullYear()} BelajarFinance. {dict.footer.copyright}
      </div>
    </footer>
  );
}