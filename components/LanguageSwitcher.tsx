'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const pathname = usePathname() || '/en';
  const isEN = pathname.startsWith('/en');
  const target = isEN ? pathname.replace('/en', '/bm') : pathname.replace('/bm', '/en');
  return (
    <Link href={target || (isEN ? '/bm' : '/en')}>
      {isEN ? 'BM' : 'EN'}
    </Link>
  );
}
