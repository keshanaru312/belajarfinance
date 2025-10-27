"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // Detect current language from the URL
  const lang = pathname.split("/")[1] === "bm" ? "bm" : "en";

  // Save language preference whenever it changes
  useEffect(() => {
    localStorage.setItem("preferredLang", lang);
  }, [lang]);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "bm" : "en";
    let newPath;
  
    if (/^\/(en|bm)(\/|$)/.test(pathname)) {
      newPath = pathname.replace(/^\/(en|bm)/, `/${newLang}`);
    } else {
      newPath = `/${newLang}${pathname}`;
    }
  
    localStorage.setItem("preferredLang", newLang);
    // Also set a cookie to ensure server-side persistence for language preference
    document.cookie = `preferredLang=${newLang}; path=/; max-age=31536000`; // persist for 1 year
    router.push(newPath);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
      aria-label="Switch language"
    >
      {lang === "en" ? "BM" : "EN"}
    </button>
  );
}