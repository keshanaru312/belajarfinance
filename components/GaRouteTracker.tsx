'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function GaRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_location: window.location.href,
        page_path: pathname + (searchParams?.toString() ? `?${searchParams}` : ''),
      });
    }
  }, [pathname, searchParams]);

  return null;
}
