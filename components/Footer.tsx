"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";

export default function Footer() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "en";
  const dict = getDictionary(lang);

  return (
    <footer className="w-full mt-12 border-t border-gray-200 dark:border-gray-700 bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 text-center md:text-left">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Belajar<span className="text-blue-600">Finance</span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dict.footer.tagline}
          </p>
        </div>

        <div className="flex justify-center md:justify-end space-x-6">
          <Link href={`/${lang}/tools`}>{dict.nav.tools}</Link>
          <Link href={`/${lang}/about`}>{dict.nav.about}</Link>
          <Link href={`/${lang}/contact`}>{dict.nav.contact}</Link>
        </div>
      </div>
      <div className="border-t border-gray-100 dark:border-gray-800 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} BelajarFinance. {dict.footer.copyright}
      </div>
    </footer>
  );
}